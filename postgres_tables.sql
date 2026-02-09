-- system_email
CREATE TABLE system_email (
    system_email_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    purpose VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

-- staff
CREATE TABLE staff (
    staff_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    staff_type VARCHAR(20) NOT NULL CHECK (staff_type IN ('general','student')),
    role VARCHAR(50) NOT NULL,
    work_status VARCHAR(20) DEFAULT 'active' CHECK (work_status IN ('active','inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- general_staff
CREATE TABLE general_staff (
    staff_id INT PRIMARY KEY REFERENCES staff(staff_id)
);

-- student_staff
CREATE TABLE student_staff (
    staff_id INT PRIMARY KEY REFERENCES staff(staff_id),
    working_hours INT
);

-- qualification
CREATE TABLE qualification (
    qualification_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- general_staff_qualification
CREATE TABLE general_staff_qualification (
    staff_id INT REFERENCES general_staff(staff_id),
    qualification_id INT REFERENCES qualification(qualification_id),
    PRIMARY KEY (staff_id, qualification_id)
);

-- customers
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_uitm_member BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected')),
    cust_type VARCHAR(20) NOT NULL CHECK (cust_type IN ('uitm_member','regular')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- member_verification
CREATE TABLE member_verification (
    verification_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    uitm_email VARCHAR(100),
    otp_code VARCHAR(10),
    expiry_time TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE
);

-- service_category
CREATE TABLE service_category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male','female','unisex'))
);

-- service
CREATE TABLE service (
    service_id SERIAL PRIMARY KEY,
    category_id INT REFERENCES service_category(category_id),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(150),
    price NUMERIC(10,2) NOT NULL,
    duration_minutes INT NOT NULL
);

-- treatment_room
CREATE TABLE treatment_room (
    room_id SERIAL PRIMARY KEY,
    room_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','occupied','maintenance'))
);

-- schedule
CREATE TABLE schedule (
    schedule_id SERIAL PRIMARY KEY,
    staff_id INT REFERENCES staff(staff_id),
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_by VARCHAR(20) NOT NULL CHECK (created_by IN ('admin','staff')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','cancelled'))
);

-- slot
CREATE TABLE slot (
    slot_id SERIAL PRIMARY KEY,
    staff_id INT REFERENCES staff(staff_id),
    service_id INT REFERENCES service(service_id),
    room_id INT REFERENCES treatment_room(room_id),
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','booked'))
);

-- booking
CREATE TABLE booking (
    booking_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    slot_id INT UNIQUE REFERENCES slot(slot_id),
    total_amount NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    final_amount NUMERIC(10,2) NOT NULL,
    deposit_amount NUMERIC(10,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','cancelled','completed')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('stripe','qr')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','paid')),
    digital_receipt BYTEA
);

-- booking_participant
CREATE TABLE booking_participant (
    participant_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES booking(booking_id),
    name VARCHAR(100),
    relationship VARCHAR(50),
    is_uitm_member BOOLEAN
);

-- review
CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    booking_id INT UNIQUE REFERENCES booking(booking_id),
    customer_id INT REFERENCES customers(customer_id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    date DATE,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- promotion
CREATE TABLE promotion (
    promotion_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage','fixed')),
    discount_value NUMERIC(10,2) NOT NULL,
    banner_image VARCHAR(255),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE
);

-- promotion_service
CREATE TABLE promotion_service (
    promotion_id INT REFERENCES promotion(promotion_id),
    service_id INT REFERENCES service(service_id),
    PRIMARY KEY (promotion_id, service_id)
);
