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
  userTasks: Array<{
    id: string;
    name: string;
    description: string;
    state: string;
    actualOwner?: string;
    started?: string;
    completed?: string;
    lastUpdate: string;
    comments: Array<{
      id: string;
      content: string;
      updatedBy: string;
      updatedAt: string;
    }>;
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
            status: this.determineNodeStatus(node, processInstance?.state),
            startTime: undefined,
            endTime: undefined,
            assignee: node.actualOwner
          })) || [],
          userTasks: userTasks.map((task: any) => ({
            id: task.id,
            name: task.name,
            description: task.description,
            state: task.state,
            actualOwner: task.actualOwner,
            started: task.started,
            completed: task.completed,
            lastUpdate: task.lastUpdate,
            comments: task.comments || []
          })),
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
        ProcessInstances(where: {id: {equal: $processInstanceId}}) {
          id
          processId
          processName
          state
          start
          end
          businessKey
          variables
        }
      }
    `;

    return this.http.post<{ data: { ProcessInstances: any[] } }>(this.graphqlUrl, {
      query,
      variables: { processInstanceId }
    }).pipe(
      map(response => {
        if (!response?.data?.ProcessInstances || response.data.ProcessInstances.length === 0) {
          return null;
        }
        return response.data.ProcessInstances[0];
      })
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

  private determineNodeStatus(node: any, processState: string): string {
    // If the process is completed, all nodes are completed
    if (processState === 'COMPLETED') {
      return 'completed';
    }

    // For user tasks (HumanTaskNode), determine status based on node properties
    if (node.type === 'HumanTaskNode') {
      // If there's an actualOwner, the task is claimed/in progress
      if (node.actualOwner) {
        return 'in_progress';
      }
      // If no actualOwner but task exists, it's ready
      return 'ready';
    }

    // For service tasks (WorkItemNode) and other node types
    if (node.type === 'WorkItemNode') {
      // Service tasks are typically completed if they appear in the nodes list
      return 'completed';
    }

    // For start nodes
    if (node.type === 'StartNode') {
      return 'completed';
    }

    // For rule set nodes (DMN decisions)
    if (node.type === 'RuleSetNode') {
      return 'completed';
    }

    // For link nodes (throw/catch)
    if (node.type === 'ThrowLinkNode' || node.type === 'CatchLinkNode') {
      return 'completed';
    }

    // Default status for other node types
    return 'completed';
  }
}
