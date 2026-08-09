# Dashboard contract

- **Purpose:** role-relevant summary of current SchoolPulse 1.0 information.
- **Sources:** no own table; reads Timetable, Attendance, Results and Learning services.
- **Roles:** every signed-in school user.
- **Reads:** only data already allowed in the source domains.
- **Writes:** none; dashboard actions link to their owning domain.
- **Dependencies:** Identity plus the four summarised educational domains.
- **Outside 1.0:** executive AI, predictive insights and advanced analytics.
