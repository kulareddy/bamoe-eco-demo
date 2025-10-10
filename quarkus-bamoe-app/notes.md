isResolved = false;
 com.example.bamoe.model.EnquiryStatus enquiryStatus = (com.example.bamoe.model.EnquiryStatus) kcontext.getVariable("enquiryStatus");
 if (enquiryStatus != null && enquiryStatus == com.example.bamoe.model.EnquiryStatus.RESOLVED) {
     isResolved = true;
 }

 isClosed = false;
 com.example.bamoe.model.EnquiryStatus enquiryStatus = (com.example.bamoe.model.EnquiryStatus) kcontext.getVariable("enquiryStatus");
 if (enquiryStatus != null && enquiryStatus == com.example.bamoe.model.EnquiryStatus.CLOSED) {
     isClosed = true;
 }

 isReopen = false;
 com.example.bamoe.model.EnquiryStatus enquiryStatus = (com.example.bamoe.model.EnquiryStatus) kcontext.getVariable("enquiryStatus");
 if (enquiryStatus != null && enquiryStatus == com.example.bamoe.model.EnquiryStatus.RE_OPEN) {
     isReopen = true;
 }

 isCancelled = false;
 com.example.bamoe.model.EnquiryStatus enquiryStatus = (com.example.bamoe.model.EnquiryStatus) kcontext.getVariable("enquiryStatus");
 if (enquiryStatus != null && enquiryStatus == com.example.bamoe.model.EnquiryStatus.CANCELLED) {
     isCancelled = true;
 }

{
"comment": {
  "comment": "This is a note or comment.",
  "commentedBy": {
    "id": "user1",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "commentedAt": "2025-10-09T14:30:00"
}
}
 