-- ==========================
-- TABLES FOR UniSpa
-- PostgreSQL version
-- ==========================

CREATE TABLE system_email (
    system_email_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    purpose VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE staff (
    staff_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    staff_type VARCHAR(10) CHECK (staff_type IN ('general','student')) NOT NULL,
    role VARCHAR(50) NOT NULL,
    work_status VARCHAR(10) CHECK (work_status IN ('active','inactive')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE general_staff (
    staff_id INT PRIMARY KEY REFERENCES staff(staff_id)
);

CREATE TABLE student_staff (
    staff_id INT PRIMARY KEY REFERENCES staff(staff_id),
    working_hours INT
);

CREATE TABLE qualification (
    qualification_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE general_staff_qualification (
    staff_id INT REFERENCES general_staff(staff_id),
    qualification_id INT REFERENCES qualification(qualification_id),
    PRIMARY KEY (staff_id, qualification_id)
);

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_uitm_member BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(10) CHECK (verification_status IN ('pending','verified','rejected')) DEFAULT 'pending',
    cust_type VARCHAR(15) CHECK (cust_type IN ('uitm_member','regular')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE member_verification (
    verification_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(customer_id),
    uitm_email VARCHAR(100),
    otp_code VARCHAR(10),
    expiry_time TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE service_category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male','female','unisex')) NOT NULL
);

CREATE TABLE service (
    service_id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES service_category(category_id),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(150),
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INT NOT NULL
);

CREATE TABLE treatment_room (
    room_id SERIAL PRIMARY KEY,
    room_type VARCHAR(50) NOT NULL,
    status VARCHAR(15) CHECK (status IN ('available','occupied','maintenance')) DEFAULT 'available'
);

CREATE TABLE schedule (
    schedule_id SERIAL PRIMARY KEY,
    staff_id INT NOT NULL REFERENCES staff(staff_id),
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_by VARCHAR(10) CHECK (created_by IN ('admin','staff')) NOT NULL,
    status VARCHAR(10) CHECK (status IN ('active','cancelled')) DEFAULT 'active'
);

CREATE TABLE slot (
    slot_id SERIAL PRIMARY KEY,
    staff_id INT NOT NULL REFERENCES staff(staff_id),
    service_id INT NOT NULL REFERENCES service(service_id),
    room_id INT NOT NULL REFERENCES treatment_room(room_id),
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(10) CHECK (status IN ('available','booked')) DEFAULT 'available'
);

CREATE TABLE booking (
    booking_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(customer_id),
    slot_id INT UNIQUE NOT NULL REFERENCES slot(slot_id),
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2),
    status VARCHAR(10) CHECK (status IN ('pending','accepted','cancelled','completed')) DEFAULT 'pending',
    payment_method VARCHAR(10) CHECK (payment_method IN ('stripe','qr')),
    payment_status VARCHAR(10) CHECK (payment_status IN ('pending','paid')) DEFAULT 'pending',
    digital_receipt BYTEA
);

CREATE TABLE booking_participant (
    participant_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES booking(booking_id),
    name VARCHAR(100),
    relationship VARCHAR(50),
    is_uitm_member BOOLEAN
);

CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    booking_id INT UNIQUE NOT NULL REFERENCES booking(booking_id),
    customer_id INT NOT NULL REFERENCES customers(customer_id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    date DATE,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE promotion (
    promotion_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type VARCHAR(15) CHECK (discount_type IN ('percentage','fixed')) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    banner_image VARCHAR(255),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE promotion_service (
    promotion_id INT REFERENCES promotion(promotion_id),
    service_id INT REFERENCES service(service_id),
    PRIMARY KEY (promotion_id, service_id)
);

