# Stage 1

## Priority Inbox Design Approach

The Priority Inbox is designed to ensure users never lose track of critical updates amidst a high volume of notifications. The priority algorithm evaluates notifications based on two primary dimensions: **Weight** and **Recency**.

### 1. Weight Assignment
Different types of notifications carry different levels of importance. We assign a numerical weight to each type to establish a baseline priority:
- **Placement:** Weight 3 (Highest Priority)
- **Result:** Weight 2
- **Event:** Weight 1 (Lowest Priority)

### 2. Recency
Between notifications of the same type/weight, recency acts as the tie-breaker. Newer notifications (based on the `Timestamp`) are prioritized over older ones.

### 3. Maintaining the Top 10 Efficiently
While the frontend implementation fetches notifications and sorts them client-side for demonstration purposes, an optimal production-grade backend would handle this using one of the following efficient methods:

- **Database Query Optimization:** Utilize a SQL or NoSQL query with an `ORDER BY` clause sorting first by the mapped `Weight` descending, then by `Timestamp` descending, combined with a `LIMIT 10` clause. Indexes on `(Type, Timestamp)` would drastically improve read performance.
- **In-Memory Priority Queue (Min-Heap):** If processing an active stream of incoming notifications, a Min-Heap of size 10 can be maintained. As new notifications arrive, they are compared against the minimum priority element in the heap. If the new notification has a higher priority, the minimum is popped, and the new one is inserted. This guarantees $O(\log n)$ insertion time and constant $O(1)$ space for maintaining the top 10.

---

# Stage 2

## Frontend Architecture

The frontend is built using **React** with **TypeScript**, bundled by **Vite**, to ensure a fast, robust, and type-safe development environment.

### State and Persistence
- **Viewed Tracking:** To distinguish between "new" and "already viewed" notifications without relying on a backend database, the application utilizes the browser's `localStorage`. When a user clicks a notification, its unique `ID` is appended to a `Set` of viewed IDs stored locally.
- **Visual Distinction:** Unread notifications feature bold typography and a primary-colored "New" badge. Once viewed, the styling defaults to standard typography, removing the badge.

### Priority Inbox Implementation
- The Priority Inbox page allows users to define the number of top notifications (`n`) and filter by `notification_type`.
- Upon fetching the list from the Notifications API, the client-side applies the weight-recency sorting algorithm described in Stage 1 to present the prioritized list seamlessly.

### Logging Integration
The application utilizes a custom, reusable TypeScript package (`logging_middleware`) to capture lifecycle events. The logging utility intercepts actions (such as API fetches and authentication flows) and securely POSTs the details to the centralized evaluation logging service.
