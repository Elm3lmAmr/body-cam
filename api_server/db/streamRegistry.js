/**
 * streamRegistry.js
 * In-memory registry for active body-cam streaming sessions.
 *
 * Key  : employee_code  (string)
 * Value: { stream_id, device_serial, status, gps: { latitude, longitude }, startedAt }
 */

const activeStreams = new Map();

module.exports = {
  /**
   * Register or update a streaming session for an employee.
   * @param {string} employeeCode
   * @param {{ stream_id: string, device_serial: string, status: string, gps: { latitude: number, longitude: number }, startedAt: string }} data
   */
  set(employeeCode, data) {
    activeStreams.set(employeeCode, data);
  },

  /**
   * Retrieve the session entry for an employee, or undefined if not present.
   * @param {string} employeeCode
   */
  get(employeeCode) {
    return activeStreams.get(employeeCode);
  },

  /**
   * Remove an employee's session from the registry.
   * @param {string} employeeCode
   */
  remove(employeeCode) {
    activeStreams.delete(employeeCode);
  },

  /**
   * Return all active sessions as an array of [employeeCode, sessionData] pairs.
   * @returns {Array<[string, object]>}
   */
  getAll() {
    return [...activeStreams.entries()];
  },
};
