abstract class IncidentRepository {
  Future<void> fetchIncidents();
  Future<void> reportIncident(String details);
}
