# Architecture Diagram: Process Instance ID as Glue

## Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Spring Boot    │    │  Quarkus BAMOE  │
│   (Angular)     │    │   (Data Layer)   │    │ (Process Layer) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐              ┌───▼───┐              ┌────▼────┐
    │ Enquiry │              │Enquiry│              │Process  │
    │ Object  │              │ Table │              │Instance │
    │         │              │       │              │         │
    │ id: 123 │◄─────────────┤id: 123│              │id: 456  │
    │processId│              │procId │◄─────────────┤         │
    │: 456    │              │: 456  │              │         │
    └─────────┘              └───────┘              └─────────┘
         │                       │                       │
         │                       │                       │
         │ 1. Read Data          │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 2. Write Operations   │                       │
         │──────────────────────────────────────────────►│
         │                       │                       │
         │ 3. Process Instance ID│                       │
         │    as Glue            │                       │
         │◄──────────────────────────────────────────────┤
```

## Key Integration Points

### 1. Enquiry Creation Flow
```
Frontend → BAMOE Process Service → Process Instance Created
    ↓
Process Instance ID stored in Enquiry object
    ↓
Spring Boot stores Enquiry with processInstanceId reference
```

### 2. Enquiry Operations Flow
```
Frontend reads Enquiry from Spring Boot (includes processInstanceId)
    ↓
Frontend uses processInstanceId for BAMOE operations
    ↓
BAMOE updates process state
    ↓
Spring Boot data reflects process changes
```

### 3. Data Consistency
- **Spring Boot**: Source of truth for enquiry data
- **BAMOE**: Source of truth for process state and workflow
- **Process Instance ID**: The glue that links them together
- **Frontend**: Uses both services with process instance ID as the bridge

## API Endpoints Mapping

| Operation | Service | Endpoint | Purpose |
|-----------|---------|----------|---------|
| List Enquiries | Spring Boot | `GET /api/enquiries` | Read enquiry data with processInstanceId |
| Get Enquiry | Spring Boot | `GET /api/enquiries/{id}` | Read enquiry details with processInstanceId |
| Create Enquiry | BAMOE | `POST /EnquiryProcess` | Create process instance, returns processInstanceId |
| Add Comment | BAMOE | `POST /EnquiryProcess/{processInstanceId}/comment` | Add comment via process |
| Cancel Enquiry | BAMOE | `POST /EnquiryProcess/{processInstanceId}/cancel` | Cancel via process |
| Reopen Enquiry | BAMOE | `POST /EnquiryProcess/{processInstanceId}/reopen` | Reopen via process |
| Close Enquiry | BAMOE | `POST /EnquiryProcess/{processInstanceId}/close` | Close via process |

## Benefits of This Architecture

1. **Clear Separation**: Data vs Process concerns
2. **Data Integrity**: Process-driven state changes
3. **Scalability**: Independent scaling of data and process services
4. **Auditability**: Process instance tracks all state changes
5. **Flexibility**: Easy to add new process steps or data fields
6. **Consistency**: Single source of truth for each concern