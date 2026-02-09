-- ==========================
-- INITIAL DATA
-- ==========================

-- System Emails
INSERT INTO system_email (email, purpose, is_active) VALUES
('unispa.system@student.uitm.edu.my','OTP',TRUE),
('unispa.system@payment.com','PAYMENT',TRUE),
('unispa.system@notification.com','NOTIFICATION',TRUE);

-- Qualifications
INSERT INTO qualification (name) VALUES
('Massage'),
('Facials'),
('Hair Styling'),
('Hair Coloring'),
('Manicure'),
('Pedicure'),
('Makeup'),
('Customer Service');

-- Service Categories
INSERT INTO service_category (name, gender) VALUES
('Barber & Hair Spa','male'),
('Massage Therapist','unisex'),
('Beauty & Facial','female'),
('Nail Treatment','female');

-- Treatment Rooms
INSERT INTO treatment_room (room_type) VALUES
('Massage'),
('Hair'),
('Facial'),
('Nail');

-- Staff
INSERT INTO staff (name, email, phone, password, staff_type, role) VALUES
('Aisyah Ahmad','aisyah@gmail.com','0121111111','$2y$hash','general','Therapist'),
('Farah Hana','farah@gmail.com','0121111112','$2y$hash','general','Therapist'),
('Nur Izzati','dinihasya15@gmail.com','0121111113','$2y$10$1hbliXW3aMp01cn78rF4t.mf4UzvjRODL.Xc.9tUoxBOOnyg7B8Psq','general','Admin'),
('Siti Balqis','balqis@gmail.com','0121111114','$2y$hash','general','Therapist'),
('Daniel Ashar','daniel@gmail.com','0192222221','$2y$hash','student','Therapist'),
('Afiq Daniel','afiq@gmail.com','0192222222','$2y$hash','student','Therapist'),
('Haziq Amir','haziq@gmail.com','0192222223','$2y$hash','student','Receptionist');

-- Split general and student staff
INSERT INTO general_staff (staff_id)
SELECT staff_id FROM staff WHERE staff_type='general';

INSERT INTO student_staff (staff_id, working_hours)
SELECT staff_id, 20 FROM staff WHERE staff_type='student';

-- Assign qualifications
INSERT INTO general_staff_qualification (staff_id, qualification_id)
SELECT s.staff_id, q.qualification_id
FROM staff s, qualification q
WHERE s.name='Aisyah Ahmad' AND q.name IN ('Massage','Facials');

INSERT INTO general_staff_qualification (staff_id, qualification_id)
SELECT s.staff_id, q.qualification_id
FROM staff s, qualification q
WHERE s.name='Farah Hana' AND q.name IN ('Hair Styling','Hair Coloring');

INSERT INTO general_staff_qualification (staff_id, qualification_id)
SELECT s.staff_id, q.qualification_id
FROM staff s, qualification q
WHERE s.name='Siti Balqis' AND q.name IN ('Manicure','Pedicure');

-- Customers
INSERT INTO customers (name, email, password, phone, is_uitm_member, verification_status, cust_type)
VALUES
('Nur Aina','2025179327@student.uitm.edu.my','$2y$hash','0131000001',TRUE,'verified','uitm_member'),
('Amirah Sofea','2024123456@student.uitm.edu.my','$2y$hash','0131000002',TRUE,'verified','uitm_member'),
('Adam Lee','adam@gmail.com','$2y$hash','0132000001',FALSE,'pending','regular'),
('John Tan','john@gmail.com','$2y$hash','0132000002',FALSE,'pending','regular'),
('Aisyah Zulaikha','aisyahz@gmail.com','$2y$hash','0132000003',FALSE,'pending','regular');

-- Member Verification
INSERT INTO member_verification (customer_id, uitm_email, otp_code, expiry_time, is_verified)
SELECT customer_id, email, '123456', '2025-08-30 23:59:00', TRUE
FROM customers
WHERE is_uitm_member = TRUE;

-- Services
INSERT INTO service (category_id, name, description, price, duration_minutes)
SELECT category_id,'Aromatherapy Massage','Relaxing full body massage',120,60
FROM service_category WHERE name='Massage Therapist';

INSERT INTO service (category_id, name, description, price, duration_minutes)
SELECT category_id,'Deep Tissue Massage','Muscle relief treatment',150,75
FROM service_category WHERE name='Massage Therapist';

INSERT INTO service (category_id, name, description, price, duration_minutes)
SELECT category_id,'Hair Cut','Basic haircut service',30,30
FROM service_category WHERE name='Barber & Hair Spa';

INSERT INTO service (category_id, name, description, price, duration_minutes)
SELECT category_id,'Facial Treatment','Skin cleansing and hydration',80,45
FROM service_category WHERE name='Beauty & Facial';

-- Slots
INSERT INTO slot (staff_id, service_id, room_id, slot_date, start_time, end_time)
SELECT s.staff_id, sv.service_id, r.room_id, '2025-08-15','10:00','11:00'
FROM staff s, service sv, treatment_room r
WHERE s.name='Daniel Ashar' AND sv.name='Aromatherapy Massage' AND r.room_type='Massage';

INSERT INTO slot (staff_id, service_id, room_id, slot_date, start_time, end_time)
SELECT s.staff_id, sv.service_id, r.room_id, '2025-08-15','11:30','12:00'
FROM staff s, service sv, treatment_room r
WHERE s.name='Afiq Daniel' AND sv.name='Hair Cut' AND r.room_type='Hair';

-- Booking
INSERT INTO booking (customer_id, slot_id, total_amount, final_amount, payment_method, payment_status)
SELECT c.customer_id, sl.slot_id, 120, 120, 'stripe', 'paid'
FROM customers c
CROSS JOIN slot sl
WHERE c.email = '2025179327@student.uitm.edu.my'
AND sl.slot_id = 1;  -- Specify which slot

-- Review for a specific booking (by booking_id)
INSERT INTO review (booking_id, customer_id, rating, comment, date, start_time, end_time)
SELECT b.booking_id, b.customer_id, 5, 'Excellent service and friendly staff',
       sl.slot_date, sl.start_time, sl.end_time
FROM booking b
JOIN slot sl ON b.slot_id = sl.slot_id
WHERE b.booking_id = 1;  -- Replace with actual booking_id
