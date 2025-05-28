const bcrypt = require('bcrypt');
const { User, Student, Role, Faculty, Class } = require('../models');

async function createTestStudent() {
  try {
    console.log('Creating test student...');

    // 1. Find student role
    const studentRole = await Role.findOne({ where: { name: 'student' } });
    if (!studentRole) {
      console.error('Student role not found. Please run database initialization first.');
      return;
    }

    // 2. Find or create faculty
    let faculty = await Faculty.findOne({ where: { faculty_abbr: 'CNTT' } });
    if (!faculty) {
      faculty = await Faculty.create({
        faculty_abbr: 'CNTT',
        name: 'Công nghệ thông tin'
      });
      console.log('Created faculty:', faculty.name);
    }

    // 3. Find or create class
    let studentClass = await Class.findOne({ where: { name: '21CNTT1' } });
    if (!studentClass) {
      studentClass = await Class.create({
        name: '21CNTT1',
        faculty_id: faculty.id,
        cohort: 2021
      });
      console.log('Created class:', studentClass.name);
    }

    // 4. Check if test student already exists
    const existingUser = await User.findOne({ where: { email: 'student.test@uit.edu.vn' } });
    if (existingUser) {
      console.log('Test student already exists with email: student.test@uit.edu.vn');
      return;
    }

    const existingStudent = await Student.findOne({ where: { student_id: '21520001' } });
    if (existingStudent) {
      console.log('Test student already exists with ID: 21520001');
      return;
    }

    // 5. Create user
    const hashedPassword = await bcrypt.hash('123456', 10);
    const user = await User.create({
      user_name: '21520001',
      email: 'student.test@uit.edu.vn',
      password: hashedPassword,
      role_id: studentRole.id
    });

    // 6. Create student
    const student = await Student.create({
      student_id: '21520001',
      student_name: 'Nguyễn Văn Test',
      user_id: user.id,
      class_id: studentClass.id,
      faculty_id: faculty.id,
      phone: '0123456789',
      birthdate: '2003-01-01',
      status: 'none',
      classification: 'Giỏi',
      sumscore: 85.5
    });

    console.log('✅ Test student created successfully!');
    console.log('📧 Email: student.test@uit.edu.vn');
    console.log('🔑 Password: 123456');
    console.log('🆔 Student ID:', student.student_id);
    console.log('👤 Name:', student.student_name);

  } catch (error) {
    console.error('❌ Error creating test student:', error);
  }
}

// Run if called directly
if (require.main === module) {
  createTestStudent().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = createTestStudent; 