const sequelize = require('../config/db');

// Import models
const User = require('./user.model');
const Role = require('./role.model');
const EmailVerificationCode = require('./EmailVerificationCode.model');
const Faculty = require('./faculty.model');
const Advisor = require('./advisor.model');
const Class = require('./class.model');
const Student = require('./student.model');
const DepartmentOfficer = require('./departmentOfficer.model');
const Criteria = require('./criteria.model');
const Campaign = require('./campaign.model');
const Activity = require('./activity.model');
const StudentActivity = require('./studentActivity.model');
const StudentScore = require('./studentScore.model');
const Ranking = require('./ranking.model');
const Permission = require('./permission.model');
const RolePermission = require('./rolePermission.model');

// ==== Associations ====
// User - Role
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

// Role - Permission
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id' });

// User - EmailVerificationCode
User.hasMany(EmailVerificationCode, { foreignKey: 'user_id' });
EmailVerificationCode.belongsTo(User, { foreignKey: 'user_id' });

// Advisor - User
Advisor.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Advisor, { foreignKey: 'user_id' });

// Advisor - Faculty
Advisor.belongsTo(Faculty, { foreignKey: 'faculty_id' });
Faculty.hasMany(Advisor, { foreignKey: 'faculty_id' });

// Class - Faculty
Class.belongsTo(Faculty, { foreignKey: 'faculty_id' });
Faculty.hasMany(Class, { foreignKey: 'faculty_id' });

// Class - Advisor
Class.belongsTo(Advisor, { foreignKey: 'advisor_id' });
Advisor.hasMany(Class, { foreignKey: 'advisor_id' });

// Class - Student (class leader)
Class.belongsTo(Student, { foreignKey: 'class_leader_id', as: 'class_leader' });
Student.hasOne(Class, { foreignKey: 'class_leader_id', as: 'leading_class' });

// Student - User
Student.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Student, { foreignKey: 'user_id' });

// Student - Class
Student.belongsTo(Class, { foreignKey: 'class_id' });
Class.hasMany(Student, { foreignKey: 'class_id' });

// Student - Faculty
Student.belongsTo(Faculty, { foreignKey: 'faculty_id' });
Faculty.hasMany(Student, { foreignKey: 'faculty_id' });

// DepartmentOfficer - User
DepartmentOfficer.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(DepartmentOfficer, { foreignKey: 'user_id' });

// Criteria - User (created_by)
Criteria.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Criteria, { foreignKey: 'created_by', as: 'created_criteria' });

// Campaign - Criteria
Campaign.belongsTo(Criteria, { foreignKey: 'criteria_id' });
Criteria.hasMany(Campaign, { foreignKey: 'criteria_id' });

// Campaign - User (created_by)
Campaign.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Campaign, { foreignKey: 'created_by', as: 'created_campaigns' });

// Activity - Campaign
Activity.belongsTo(Campaign, { foreignKey: 'campaign_id' });
Campaign.hasMany(Activity, { foreignKey: 'campaign_id' });

// Activity - User (created_by, approver_id)
Activity.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Activity.belongsTo(User, { foreignKey: 'approver_id', as: 'approver' });

// StudentActivity - Student & Activity
StudentActivity.belongsTo(Student, { foreignKey: 'student_id' });
Student.hasMany(StudentActivity, { foreignKey: 'student_id' });

StudentActivity.belongsTo(Activity, { foreignKey: 'activity_id' });
Activity.hasMany(StudentActivity, { foreignKey: 'activity_id' });

// StudentScore - Student
StudentScore.belongsTo(Student, { foreignKey: 'student_id' });
Student.hasMany(StudentScore, { foreignKey: 'student_id' });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  EmailVerificationCode,
  Faculty,
  Advisor,
  Class,
  Student,
  DepartmentOfficer,
  Criteria,
  Campaign,
  Activity,
  StudentActivity,
  StudentScore,
  Ranking,
};
