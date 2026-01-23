const AuditLog = require('../models/AuditLog');

/**
 * Audit logging middleware
 * Logs all CREATE, UPDATE, DELETE, APPROVE operations
 */
const auditLog = (entity) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override res.json to capture response
    res.json = function(data) {
      // Only log on successful operations
      if (data.success && res.statusCode < 400) {
        const logData = {
          entity,
          entityId: data.data?._id || req.params.id,
          action: determineAction(req.method, req.path),
          performedBy: req.user?._id || req.practitioner?._id,
          performedByModel: req.userRole === 'user' ? 'User' : 'Practitioner',
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        };

        // Store changes for UPDATE operations
        if (req.method === 'PUT' || req.method === 'PATCH') {
          logData.changes = req.body;
        }

        // Log asynchronously (don't block response)
        AuditLog.create(logData).catch(err => {
          console.error('Audit log error:', err);
        });
      }

      // Call original json method
      return originalJson(data);
    };

    next();
  };
};

/**
 * Determine action type from HTTP method and path
 */
const determineAction = (method, path) => {
  if (method === 'POST') {
    return 'CREATE';
  } else if (method === 'PUT' || method === 'PATCH') {
    if (path.includes('/approve')) return 'APPROVE';
    if (path.includes('/verify')) return 'VERIFY';
    if (path.includes('/archive')) return 'ARCHIVE';
    return 'UPDATE';
  } else if (method === 'DELETE') {
    return 'DELETE';
  }
  return 'UPDATE';
};

/**
 * Manual audit log function for custom scenarios
 */
const createAuditLog = async (entity, entityId, action, performedBy, performedByModel, changes = null) => {
  try {
    await AuditLog.create({
      entity,
      entityId,
      action,
      performedBy,
      performedByModel,
      changes,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Manual audit log error:', error);
  }
};

module.exports = {
  auditLog,
  createAuditLog
};
