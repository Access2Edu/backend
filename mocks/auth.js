export const studentAuth = (req, res, next) => {
    req.user = { id: 'mockStudentId', role: 'student', email: 'student@test.com' };
    next();
  };
  
  export const adminAuth = (req, res, next) => {
    req.user = { id: 'mockAdminId', role: 'admin', email: 'admin@test.com' };
    next();
  };
  
  export const teacherAuth = (req, res, next) => {
    req.user = { id: 'mockTeacherId', role: 'teacher', email: 'teacher@test.com' };
    next();
  };
  
  export const superAdminAuth = (req, res, next) => {
    req.user = { id: 'mockSuperAdminId', role: 'superadmin', email: 'superadmin@test.com' };
    next();
  };
  
  export const isAuthenticated = (req, res, next) => {
    req.user = { id: 'mockUserId', role: 'authenticated', email: 'user@test.com' };
    next();
  };
  