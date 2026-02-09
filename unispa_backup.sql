--
-- PostgreSQL database dump
--

\restrict 4Ppt6oBi0MdekK5kb6g8KCTs5An9ecBzmD4NnWL8KXNUtUeJYPMAqC80qGrc5eN

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: sail
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO sail;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: booking; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.booking (
    booking_id character varying(255) NOT NULL,
    customer_id bigint NOT NULL,
    slot_id character varying(255) NOT NULL,
    total_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    final_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    deposit_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    payment_method character varying(255),
    payment_status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    depo_qr_pic text,
    digital_receipt text,
    special_requests text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.booking OWNER TO sail;

--
-- Name: booking_participant; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.booking_participant (
    id bigint NOT NULL,
    booking_id character varying(255) NOT NULL,
    is_self boolean DEFAULT false NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    email character varying(255),
    is_uitm_member boolean DEFAULT false NOT NULL,
    discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.booking_participant OWNER TO sail;

--
-- Name: booking_participant_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.booking_participant_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_participant_id_seq OWNER TO sail;

--
-- Name: booking_participant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.booking_participant_id_seq OWNED BY public.booking_participant.id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.bookings (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    service_id bigint NOT NULL,
    service_name character varying(255),
    slot_date date NOT NULL,
    start_time character varying(10) NOT NULL,
    end_time character varying(10) NOT NULL,
    staff_name character varying(255),
    guest_count smallint DEFAULT '1'::smallint NOT NULL,
    guests_json json,
    total_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    deposit_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    payment_method character varying(255),
    payment_status character varying(255) DEFAULT 'unpaid'::character varying NOT NULL,
    status character varying(255) DEFAULT 'PENDING'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.bookings OWNER TO sail;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.bookings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO sail;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO sail;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO sail;

--
-- Name: cart; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.cart (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.cart OWNER TO sail;

--
-- Name: cart_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.cart_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_id_seq OWNER TO sail;

--
-- Name: cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.cart_id_seq OWNED BY public.cart.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.customers (
    customer_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    cust_type character varying(255) DEFAULT 'regular'::character varying NOT NULL,
    member_type character varying(255),
    is_uitm_member boolean DEFAULT false NOT NULL,
    verification_status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    email_verified_at timestamp without time zone,
    remember_token character varying(100),
    CONSTRAINT customers_cust_type_check CHECK (((cust_type)::text = ANY ((ARRAY['regular'::character varying, 'uitm_member'::character varying])::text[]))),
    CONSTRAINT customers_member_type_check CHECK (((member_type)::text = ANY ((ARRAY['student'::character varying, 'staff'::character varying])::text[]))),
    CONSTRAINT customers_verification_status_check CHECK (((verification_status)::text = ANY ((ARRAY['pending'::character varying, 'verified'::character varying])::text[])))
);


ALTER TABLE public.customers OWNER TO sail;

--
-- Name: customers_customer_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.customers_customer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_customer_id_seq OWNER TO sail;

--
-- Name: customers_customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.customers_customer_id_seq OWNED BY public.customers.customer_id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO sail;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO sail;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: general_staff; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.general_staff (
    staff_id bigint NOT NULL
);


ALTER TABLE public.general_staff OWNER TO sail;

--
-- Name: general_staff_qualification; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.general_staff_qualification (
    staff_id bigint NOT NULL,
    qualification_id bigint NOT NULL
);


ALTER TABLE public.general_staff_qualification OWNER TO sail;

--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO sail;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO sail;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO sail;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: member_verification; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.member_verification (
    verification_id bigint NOT NULL,
    customer_id bigint NOT NULL,
    uitm_email character varying(255),
    otp_code character varying(10),
    expiry_time timestamp without time zone,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.member_verification OWNER TO sail;

--
-- Name: member_verification_verification_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.member_verification_verification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.member_verification_verification_id_seq OWNER TO sail;

--
-- Name: member_verification_verification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.member_verification_verification_id_seq OWNED BY public.member_verification.verification_id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO sail;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO sail;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO sail;

--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO sail;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO sail;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: promotion; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.promotion (
    promotion_id bigint NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    banner_image text,
    link text,
    start_date date,
    end_date date,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT promotion_discount_type_check CHECK (((discount_type)::text = ANY ((ARRAY['percentage'::character varying, 'fixed'::character varying])::text[])))
);


ALTER TABLE public.promotion OWNER TO sail;

--
-- Name: promotion_promotion_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.promotion_promotion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promotion_promotion_id_seq OWNER TO sail;

--
-- Name: promotion_promotion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.promotion_promotion_id_seq OWNED BY public.promotion.promotion_id;


--
-- Name: promotion_service; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.promotion_service (
    promotion_id bigint NOT NULL,
    service_id bigint NOT NULL
);


ALTER TABLE public.promotion_service OWNER TO sail;

--
-- Name: qualification; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.qualification (
    qualification_id bigint NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.qualification OWNER TO sail;

--
-- Name: qualification_qualification_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.qualification_qualification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.qualification_qualification_id_seq OWNER TO sail;

--
-- Name: qualification_qualification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.qualification_qualification_id_seq OWNED BY public.qualification.qualification_id;


--
-- Name: review; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.review (
    review_id bigint NOT NULL,
    booking_id character varying(255) NOT NULL,
    customer_id bigint NOT NULL,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT review_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.review OWNER TO sail;

--
-- Name: review_review_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.review_review_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.review_review_id_seq OWNER TO sail;

--
-- Name: review_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.review_review_id_seq OWNED BY public.review.review_id;


--
-- Name: schedule; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.schedule (
    schedule_id bigint NOT NULL,
    staff_id bigint NOT NULL,
    schedule_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    created_by character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT schedule_created_by_check CHECK (((created_by)::text = ANY ((ARRAY['admin'::character varying, 'staff'::character varying])::text[]))),
    CONSTRAINT schedule_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.schedule OWNER TO sail;

--
-- Name: schedule_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.schedule_schedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schedule_schedule_id_seq OWNER TO sail;

--
-- Name: schedule_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.schedule_schedule_id_seq OWNED BY public.schedule.schedule_id;


--
-- Name: service; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.service (
    id bigint NOT NULL,
    category_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    duration_minutes integer DEFAULT 0 NOT NULL,
    image_url text,
    is_popular boolean DEFAULT false NOT NULL,
    tags json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.service OWNER TO sail;

--
-- Name: service_category; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.service_category (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    gender character varying(255),
    capacity_units integer DEFAULT 1 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.service_category OWNER TO sail;

--
-- Name: service_category_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.service_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_category_id_seq OWNER TO sail;

--
-- Name: service_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.service_category_id_seq OWNED BY public.service_category.id;


--
-- Name: service_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.service_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_id_seq OWNER TO sail;

--
-- Name: service_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.service_id_seq OWNED BY public.service.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO sail;

--
-- Name: slot; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.slot (
    slot_id character varying(255) NOT NULL,
    service_id bigint NOT NULL,
    staff_id bigint,
    slot_date date NOT NULL,
    start_time time(0) without time zone NOT NULL,
    end_time time(0) without time zone NOT NULL,
    status character varying(255) DEFAULT 'available'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.slot OWNER TO sail;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.staff (
    staff_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20),
    password character varying(255) NOT NULL,
    staff_type character varying(20) NOT NULL,
    role character varying(50) NOT NULL,
    work_status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT staff_staff_type_check CHECK (((staff_type)::text = ANY ((ARRAY['general'::character varying, 'student'::character varying])::text[]))),
    CONSTRAINT staff_work_status_check CHECK (((work_status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


ALTER TABLE public.staff OWNER TO sail;

--
-- Name: staff_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.staff_staff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_staff_id_seq OWNER TO sail;

--
-- Name: staff_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.staff_staff_id_seq OWNED BY public.staff.staff_id;


--
-- Name: student_staff; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.student_staff (
    staff_id bigint NOT NULL,
    working_hours integer
);


ALTER TABLE public.student_staff OWNER TO sail;

--
-- Name: system_email; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.system_email (
    system_email_id bigint NOT NULL,
    email character varying(100) NOT NULL,
    purpose character varying(50),
    is_active boolean DEFAULT true
);


ALTER TABLE public.system_email OWNER TO sail;

--
-- Name: system_email_system_email_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.system_email_system_email_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_email_system_email_id_seq OWNER TO sail;

--
-- Name: system_email_system_email_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.system_email_system_email_id_seq OWNED BY public.system_email.system_email_id;


--
-- Name: treatment_room; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.treatment_room (
    room_id bigint NOT NULL,
    room_type character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'available'::character varying,
    CONSTRAINT treatment_room_status_check CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'occupied'::character varying, 'maintenance'::character varying])::text[])))
);


ALTER TABLE public.treatment_room OWNER TO sail;

--
-- Name: treatment_room_room_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.treatment_room_room_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.treatment_room_room_id_seq OWNER TO sail;

--
-- Name: treatment_room_room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.treatment_room_room_id_seq OWNED BY public.treatment_room.room_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: sail
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.users OWNER TO sail;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: sail
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO sail;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sail
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: booking_participant id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.booking_participant ALTER COLUMN id SET DEFAULT nextval('public.booking_participant_id_seq'::regclass);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: cart id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.cart ALTER COLUMN id SET DEFAULT nextval('public.cart_id_seq'::regclass);


--
-- Name: customers customer_id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.customers ALTER COLUMN customer_id SET DEFAULT nextval('public.customers_customer_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: member_verification verification_id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.member_verification ALTER COLUMN verification_id SET DEFAULT nextval('public.member_verification_verification_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: promotion promotion_id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.promotion ALTER COLUMN promotion_id SET DEFAULT nextval('public.promotion_promotion_id_seq'::regclass);


--
-- Name: qualification qualification_id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.qualification ALTER COLUMN qualification_id SET DEFAULT nextval('public.qualification_qualification_id_seq'::regclass);


--
-- Name: review review_id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.review ALTER COLUMN review_id SET DEFAULT nextval('public.review_review_id_seq'::regclass);


--
-- Name: schedule schedule_id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.schedule ALTER COLUMN schedule_id SET DEFAULT nextval('public.schedule_schedule_id_seq'::regclass);


--
-- Name: service id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.service ALTER COLUMN id SET DEFAULT nextval('public.service_id_seq'::regclass);


--
-- Name: service_category id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.service_category ALTER COLUMN id SET DEFAULT nextval('public.service_category_id_seq'::regclass);


--
-- Name: staff staff_id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.staff ALTER COLUMN staff_id SET DEFAULT nextval('public.staff_staff_id_seq'::regclass);


--
-- Name: system_email system_email_id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.system_email ALTER COLUMN system_email_id SET DEFAULT nextval('public.system_email_system_email_id_seq'::regclass);


--
-- Name: treatment_room room_id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.treatment_room ALTER COLUMN room_id SET DEFAULT nextval('public.treatment_room_room_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: booking; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.booking (booking_id, customer_id, slot_id, total_amount, discount_amount, final_amount, deposit_amount, status, payment_method, payment_status, depo_qr_pic, digital_receipt, special_requests, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: booking_participant; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.booking_participant (id, booking_id, is_self, name, phone, email, is_uitm_member, discount_amount, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.bookings (id, customer_id, service_id, service_name, slot_date, start_time, end_time, staff_name, guest_count, guests_json, total_amount, deposit_amount, payment_method, payment_status, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.cart (id, customer_id, items, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.customers (customer_id, name, email, phone, cust_type, member_type, is_uitm_member, verification_status, password, created_at, updated_at, email_verified_at, remember_token) FROM stdin;
1	hasya	hasyadini15@gmail.com	0189865575	regular	\N	f	verified	$2y$12$VIRo0tl7t8KhxhzBu6JcY.q2FbSbASC.TR79PcCUJ6rC/D6KiiiMi	2026-02-07 01:35:24	2026-02-07 01:35:24	2026-02-07 01:35:24	\N
4	Nur Aina	2025179327@student.uitm.edu.my	0131000001	uitm_member	student	t	verified	$2y$12$hRFBnC8gT3FBDOW9D7HYcuk5ahrIoBIW9T2dxjVSBiy/JkTqlkg5.	2026-02-07 03:09:33	2026-02-07 03:09:34	2026-02-07 03:09:33	\N
5	Adam Lee	adam@gmail.com	0132000001	regular	\N	f	verified	$2y$12$nUd7b0cSzhTl.TKKEaekl.wHLwpfKesaJSHHCbrvcHJZriwZ81PZm	2026-02-07 03:09:34	2026-02-07 03:09:34	2026-02-07 03:09:34	\N
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: general_staff; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.general_staff (staff_id) FROM stdin;
\.


--
-- Data for Name: general_staff_qualification; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.general_staff_qualification (staff_id, qualification_id) FROM stdin;
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: member_verification; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.member_verification (verification_id, customer_id, uitm_email, otp_code, expiry_time, is_verified, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_customers_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2026_01_04_091732_add_otp_fields_to_customer_table	1
5	2026_01_04_094325_create_laravel_essential_tables	1
6	2026_01_05_000000_create_users_table	1
7	2026_01_06_000000_fix_customer_cust_type	1
8	2026_01_11_135501_create_service_category_table	1
9	2026_01_11_135512_create_service_table	1
10	2026_02_06_202431_create_carts_table	1
11	2026_02_06_202431_create_slots_table	1
12	2026_02_06_202432_000001_create_bookings_table	1
13	2026_02_06_202432_000002_create_booking_participants_table	1
14	2026_02_06_202433_add_capacity_to_service_category_table	1
15	2026_02_07_064435_create_bookings_table	2
16	2026_02_06_202432_000001_create_bookings_table	999
17	2026_02_07_064435_create_bookings_table	999
18	2026_02_06_202432_000002_create_booking_participants_table	999
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: promotion; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.promotion (promotion_id, title, description, discount_type, discount_value, banner_image, link, start_date, end_date, is_active, created_at, updated_at) FROM stdin;
1	Complete Wellness Package	Experience our signature treatments designed for total relaxation and rejuvenation.	percentage	50.00	https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80	/services	2026-02-07	\N	t	2026-02-07 03:09:34	2026-02-07 03:09:33.654118
2	Student Special Offer	Exclusive discounts for UiTM students. Show your student ID for extra benefits.	percentage	30.00	https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80	/appointment/appointment-i	2026-02-07	\N	t	2026-02-07 03:09:34	2026-02-07 03:09:33.654118
3	First Time Customer	Special welcome package for new customers. Experience Uni-Spa quality.	percentage	25.00	https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80	/appointment/appointment-i	2026-02-07	\N	t	2026-02-07 03:09:34	2026-02-07 03:09:33.654118
\.


--
-- Data for Name: promotion_service; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.promotion_service (promotion_id, service_id) FROM stdin;
\.


--
-- Data for Name: qualification; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.qualification (qualification_id, name) FROM stdin;
\.


--
-- Data for Name: review; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.review (review_id, booking_id, customer_id, rating, comment, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schedule; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.schedule (schedule_id, staff_id, schedule_date, start_time, end_time, created_by, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.service (id, category_id, name, description, price, duration_minutes, image_url, is_popular, tags, created_at, updated_at) FROM stdin;
1	2	Signature Normal Facial	Basic facial treatment	50.00	30	\N	f	[]	2026-02-07 03:09:34	2026-02-07 03:09:34
2	2	Deep Cleansing Facial	Cleanses deep impurities	100.00	60	\N	f	[]	2026-02-07 03:09:34	2026-02-07 03:09:34
3	2	Anti-Aging Facial	Normal price: RM150.00 | New price: RM99.00	99.00	90	\N	t	[]	2026-02-07 03:09:34	2026-02-07 03:09:34
4	4	Aromatherapy Massage (60 mins)	Relaxing aroma oil massage	120.00	60	\N	t	[]	2026-02-07 03:09:34	2026-02-07 03:09:34
5	4	Foot Reflexology (30 mins)	Soothes tired feet	60.00	30	\N	f	[]	2026-02-07 03:09:34	2026-02-07 03:09:34
6	6	Classic Manicure	A basic nail care treatment	55.00	45	\N	f	[]	2026-02-07 03:09:34	2026-02-07 03:09:34
7	6	Spa Pedicure	A luxurious foot care treatment	40.00	60	\N	f	[]	2026-02-07 03:09:34	2026-02-07 03:09:34
\.


--
-- Data for Name: service_category; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.service_category (id, name, gender, capacity_units, created_at, updated_at) FROM stdin;
1	Barber & Hair Spa (Men)	male	1	2026-02-07 03:09:34	2026-02-07 03:09:34
2	Facial Treatments	female	1	2026-02-07 03:09:34	2026-02-07 03:09:34
3	Makeup Session	female	1	2026-02-07 03:09:34	2026-02-07 03:09:34
4	Massage Therapy Session	unisex	1	2026-02-07 03:09:34	2026-02-07 03:09:34
5	Muslimah Hair Cut & Spa (Women)	female	1	2026-02-07 03:09:34	2026-02-07 03:09:34
6	Nail & Foot Care	female	1	2026-02-07 03:09:34	2026-02-07 03:09:34
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- Data for Name: slot; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.slot (slot_id, service_id, staff_id, slot_date, start_time, end_time, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.staff (staff_id, name, email, phone, password, staff_type, role, work_status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_staff; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.student_staff (staff_id, working_hours) FROM stdin;
\.


--
-- Data for Name: system_email; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.system_email (system_email_id, email, purpose, is_active) FROM stdin;
\.


--
-- Data for Name: treatment_room; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.treatment_room (room_id, room_type, status) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sail
--

COPY public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at) FROM stdin;
\.


--
-- Name: booking_participant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.booking_participant_id_seq', 1, false);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.bookings_id_seq', 1, false);


--
-- Name: cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.cart_id_seq', 1, false);


--
-- Name: customers_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.customers_customer_id_seq', 5, true);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: member_verification_verification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.member_verification_verification_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.migrations_id_seq', 18, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 1, false);


--
-- Name: promotion_promotion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.promotion_promotion_id_seq', 3, true);


--
-- Name: qualification_qualification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.qualification_qualification_id_seq', 1, false);


--
-- Name: review_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.review_review_id_seq', 1, false);


--
-- Name: schedule_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.schedule_schedule_id_seq', 1, false);


--
-- Name: service_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.service_category_id_seq', 6, true);


--
-- Name: service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.service_id_seq', 7, true);


--
-- Name: staff_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.staff_staff_id_seq', 1, false);


--
-- Name: system_email_system_email_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.system_email_system_email_id_seq', 1, false);


--
-- Name: treatment_room_room_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.treatment_room_room_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sail
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: booking booking_customer_id_slot_id_unique; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_customer_id_slot_id_unique UNIQUE (customer_id, slot_id);


--
-- Name: booking_participant booking_participant_booking_id_phone_unique; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.booking_participant
    ADD CONSTRAINT booking_participant_booking_id_phone_unique UNIQUE (booking_id, phone);


--
-- Name: booking_participant booking_participant_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.booking_participant
    ADD CONSTRAINT booking_participant_pkey PRIMARY KEY (id);


--
-- Name: booking booking_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_pkey PRIMARY KEY (booking_id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: cart cart_customer_id_unique; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_customer_id_unique UNIQUE (customer_id);


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);


--
-- Name: customers customers_email_unique; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_unique UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customer_id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: general_staff general_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.general_staff
    ADD CONSTRAINT general_staff_pkey PRIMARY KEY (staff_id);


--
-- Name: general_staff_qualification general_staff_qualification_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.general_staff_qualification
    ADD CONSTRAINT general_staff_qualification_pkey PRIMARY KEY (staff_id, qualification_id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: member_verification member_verification_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.member_verification
    ADD CONSTRAINT member_verification_pkey PRIMARY KEY (verification_id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: promotion promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.promotion
    ADD CONSTRAINT promotion_pkey PRIMARY KEY (promotion_id);


--
-- Name: promotion_service promotion_service_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.promotion_service
    ADD CONSTRAINT promotion_service_pkey PRIMARY KEY (promotion_id, service_id);


--
-- Name: qualification qualification_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.qualification
    ADD CONSTRAINT qualification_pkey PRIMARY KEY (qualification_id);


--
-- Name: review review_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_booking_id_key UNIQUE (booking_id);


--
-- Name: review review_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_pkey PRIMARY KEY (review_id);


--
-- Name: schedule schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (schedule_id);


--
-- Name: service service_category_id_name_unique; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.service
    ADD CONSTRAINT service_category_id_name_unique UNIQUE (category_id, name);


--
-- Name: service_category service_category_name_unique; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.service_category
    ADD CONSTRAINT service_category_name_unique UNIQUE (name);


--
-- Name: service_category service_category_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.service_category
    ADD CONSTRAINT service_category_pkey PRIMARY KEY (id);


--
-- Name: service service_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.service
    ADD CONSTRAINT service_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: slot slot_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.slot
    ADD CONSTRAINT slot_pkey PRIMARY KEY (slot_id);


--
-- Name: slot slot_service_id_slot_date_start_time_unique; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.slot
    ADD CONSTRAINT slot_service_id_slot_date_start_time_unique UNIQUE (service_id, slot_date, start_time);


--
-- Name: staff staff_email_key; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_email_key UNIQUE (email);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (staff_id);


--
-- Name: student_staff student_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.student_staff
    ADD CONSTRAINT student_staff_pkey PRIMARY KEY (staff_id);


--
-- Name: system_email system_email_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.system_email
    ADD CONSTRAINT system_email_pkey PRIMARY KEY (system_email_id);


--
-- Name: treatment_room treatment_room_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.treatment_room
    ADD CONSTRAINT treatment_room_pkey PRIMARY KEY (room_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: bookings_customer_id_index; Type: INDEX; Schema: public; Owner: sail
--

CREATE INDEX bookings_customer_id_index ON public.bookings USING btree (customer_id);


--
-- Name: bookings_service_id_index; Type: INDEX; Schema: public; Owner: sail
--

CREATE INDEX bookings_service_id_index ON public.bookings USING btree (service_id);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: sail
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: sail
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: sail
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: sail
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: customers trg_customers_updated_at; Type: TRIGGER; Schema: public; Owner: sail
--

CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: promotion trg_promotion_updated_at; Type: TRIGGER; Schema: public; Owner: sail
--

CREATE TRIGGER trg_promotion_updated_at BEFORE UPDATE ON public.promotion FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: booking booking_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: booking_participant booking_participant_booking_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.booking_participant
    ADD CONSTRAINT booking_participant_booking_id_foreign FOREIGN KEY (booking_id) REFERENCES public.booking(booking_id) ON DELETE CASCADE;


--
-- Name: booking booking_slot_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_slot_id_foreign FOREIGN KEY (slot_id) REFERENCES public.slot(slot_id) ON DELETE CASCADE;


--
-- Name: cart cart_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: general_staff fk_general_staff_staff; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.general_staff
    ADD CONSTRAINT fk_general_staff_staff FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id) ON DELETE CASCADE;


--
-- Name: general_staff_qualification fk_gsq_general_staff; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.general_staff_qualification
    ADD CONSTRAINT fk_gsq_general_staff FOREIGN KEY (staff_id) REFERENCES public.general_staff(staff_id) ON DELETE CASCADE;


--
-- Name: general_staff_qualification fk_gsq_qualification; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.general_staff_qualification
    ADD CONSTRAINT fk_gsq_qualification FOREIGN KEY (qualification_id) REFERENCES public.qualification(qualification_id) ON DELETE CASCADE;


--
-- Name: member_verification fk_member_verification_customer; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.member_verification
    ADD CONSTRAINT fk_member_verification_customer FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: promotion_service fk_promo_service_promotion; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.promotion_service
    ADD CONSTRAINT fk_promo_service_promotion FOREIGN KEY (promotion_id) REFERENCES public.promotion(promotion_id) ON DELETE CASCADE;


--
-- Name: promotion_service fk_promo_service_service; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.promotion_service
    ADD CONSTRAINT fk_promo_service_service FOREIGN KEY (service_id) REFERENCES public.service(id) ON DELETE CASCADE;


--
-- Name: review fk_review_booking; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT fk_review_booking FOREIGN KEY (booking_id) REFERENCES public.booking(booking_id) ON DELETE CASCADE;


--
-- Name: review fk_review_customer; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT fk_review_customer FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: schedule fk_schedule_staff; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT fk_schedule_staff FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id) ON DELETE CASCADE;


--
-- Name: student_staff fk_student_staff_staff; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.student_staff
    ADD CONSTRAINT fk_student_staff_staff FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id) ON DELETE CASCADE;


--
-- Name: service service_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.service
    ADD CONSTRAINT service_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.service_category(id) ON DELETE CASCADE;


--
-- Name: slot slot_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: sail
--

ALTER TABLE ONLY public.slot
    ADD CONSTRAINT slot_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.service(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 4Ppt6oBi0MdekK5kb6g8KCTs5An9ecBzmD4NnWL8KXNUtUeJYPMAqC80qGrc5eN

