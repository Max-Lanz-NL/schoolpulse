# Attendance contract

- **Purpose:** lesson attendance and absence processing.
- **Sources:** `attendance_records`, `absence_requests`.
- **Roles:** teachers record assigned lessons; administration processes absence; pupils/guardians read allowed own data.
- **Reads:** scoped attendance and absence records.
- **Writes:** teacher registration and authorised administrative review.
- **Dependencies:** Identity, People and Timetable.
- **Outside 1.0:** predictive analytics, municipal reporting automation and push alerts.
