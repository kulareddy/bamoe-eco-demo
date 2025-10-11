import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ProcessVisualizationData {
  processInstance: {
    id: string;
    processId: string;
    processName: string;
    status: string;
    startDate: string;
    endDate?: string;
    initiator: string;
    variables: Record<string, any>;
  };
  activities: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    startTime?: string; // GraphQL returns as string, will be converted to Date
    endTime?: string;   // GraphQL returns as string, will be converted to Date
    assignee?: string;
  }>;
  history: Array<{
    id: string;
    description: string;
    timestamp: string; // GraphQL returns as string, will be converted to Date
    type: string;
  }>;
  svg: string;
}

@Injectable({
  providedIn: 'root'
})
export class GraphQLService {
  private graphqlUrl = `${environment.api.processService}/graphql`;

  constructor(private http: HttpClient) {}

  /**
   * Check if GraphQL endpoint is available
   */
  isGraphQLAvailable(): Observable<boolean> {
    return this.http.post<any>(this.graphqlUrl, {
      query: '{ __schema { types { name } } }'
    }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Get the GraphQL schema to understand available fields
   */
  getSchema(): Observable<any> {
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType {
            fields {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
          types {
            name
            kind
            fields {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      }
    `;

    return this.http.post<any>(this.graphqlUrl, {
      query: introspectionQuery
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error getting GraphQL schema:', error);
        return of(null);
      })
    );
  }

  /**
   * Get complete process visualization data using BAMOE GraphQL API
   * Based on official BAMOE 9.3.0 documentation
   */
  getProcessVisualizationData(processInstanceId: string): Observable<ProcessVisualizationData> {
    const query = `
      query GetProcessVisualizationData($processInstanceId: String!) {
        ProcessInstances(where: {id: {equal: $processInstanceId}}) {
          id
          processId
          processName
          state
          start
          end
          variables
          nodes {
            id
            name
            type
            enter
            exit
            definitionId
            nodeId
            slaDueDate
            errorMessage
            retrigger
          }
          milestones {
            id
            name
            status
          }
          diagram
          createdBy
          updatedBy
          lastUpdate
        }
        UserTaskInstances(where: {processInstanceId: {equal: $processInstanceId}}) {
          id
          name
          description
          state
          actualOwner
          started
          completed
          lastUpdate
          comments {
            id
            content
            updatedBy
            updatedAt
          }
        }
      }
    `;

    return this.http.post<{ data: any, errors?: any[] }>(this.graphqlUrl, {
      query,
      variables: { processInstanceId }
    }).pipe(
      // Extract data from GraphQL response wrapper and handle errors
      map(response => {
        if (response.errors && response.errors.length > 0) {
          console.error('GraphQL Errors:', response.errors);
          throw new Error(`GraphQL errors: ${response.errors.map(e => e.message).join(', ')}`);
        }
        if (!response.data) {
          throw new Error('No data returned from GraphQL query');
        }
        
        // Transform BAMOE GraphQL response to our interface
        const processInstance = response.data.ProcessInstances?.[0];
        const userTasks = response.data.UserTaskInstances || [];
        
        return {
          processInstance: {
            id: processInstance?.id || '',
            processId: processInstance?.processId || '',
            processName: processInstance?.processName || '',
            status: processInstance?.state || '',
            startDate: processInstance?.start || '',
            endDate: processInstance?.end || '',
            initiator: processInstance?.createdBy || '',
            variables: processInstance?.variables || {}
          },
          activities: processInstance?.nodes?.map((node: any) => ({
            id: node.id,
            name: node.name,
            type: node.type,
            status: node.enter ? 'completed' : 'pending',
            startTime: node.enter,
            endTime: node.exit,
            assignee: node.actualOwner
          })) || [],
          history: userTasks.map((task: any) => ({
            id: task.id,
            description: task.description,
            timestamp: task.lastUpdate,
            type: 'task'
          })),
          svg: processInstance?.diagram || ''
        } as ProcessVisualizationData;
      })
    );
  }

  /**
   * Get process instance with variables only
   */
  getProcessInstanceWithVariables(processInstanceId: string): Observable<any> {
    const query = `
      query GetProcessInstance($processInstanceId: String!) {
        processInstance(id: $processInstanceId) {
          id
          processId
          processName
          status
          startDate
          endDate
          initiator
          variables
        }
      }
    `;

    return this.http.post<{ data: { processInstance: any } }>(this.graphqlUrl, {
      query,
      variables: { processInstanceId }
    }).pipe(
      map(response => response.data.processInstance)
    );
  }

  /**
   * Get process activities only
   */
  getProcessActivities(processInstanceId: string): Observable<any[]> {
    const query = `
      query GetProcessActivities($processInstanceId: String!) {
        activities(processInstanceId: $processInstanceId) {
          id
          name
          type
          status
          startTime
          endTime
          assignee
        }
      }
    `;

    return this.http.post<{ data: { activities: any[] } }>(this.graphqlUrl, {
      query,
      variables: { processInstanceId }
    }).pipe(
      map(response => response.data.activities)
    );
  }

  /**
   * Get process SVG only
   */
  getProcessSvg(processInstanceId: string): Observable<string> {
    const query = `
      query GetProcessSvg($processInstanceId: String!) {
        svg(processInstanceId: $processInstanceId)
      }
    `;

    return this.http.post<{ data: { svg: string } }>(this.graphqlUrl, {
      query,
      variables: { processInstanceId }
    }).pipe(
      map(response => response.data.svg)
    );
  }
}
