-- V1: esquema base de TinnitOff para PostgreSQL (perfil prod).
-- Generado a partir de las entidades JPA actuales (Hibernate, dialecto PostgreSQL) y validado con
-- spring.jpa.hibernate.ddl-auto=validate. Reemplaza la V1/V2 anteriores, que usaban sintaxis MySQL/H2
-- (AUTO_INCREMENT, DOUBLE) y estaban desfasadas respecto a las entidades; nunca llegaron a aplicarse en Postgres.
-- Cambios futuros del modelo: NUEVAS migraciones (V2__..., V3__...), no editar esta.

create table roles (
    id bigserial not null,
    name varchar(50) not null unique,
    primary key (id)
);

create table users (
    id bigserial not null,
    username varchar(50) not null unique,
    email varchar(100) not null unique,
    password varchar(120) not null,
    is_enabled boolean not null,
    role_id bigint not null,
    created_at timestamp(6),
    updated_at timestamp(6),
    primary key (id)
);

create table user_devices (
    id bigserial not null,
    user_id bigint not null,
    platform varchar(255) not null,
    device_id varchar(255) not null,
    app_version varchar(255),
    last_seen timestamp(6),
    primary key (id)
);

create table telemetry_logs (
    id bigserial not null,
    user_id bigint not null,
    event_type varchar(255) not null,
    platform varchar(255) not null,
    app_version varchar(255),
    device_info varchar(255),
    session_id varchar(255),
    payload TEXT,
    timestamp timestamp(6),
    primary key (id)
);

create table thi_results (
    id bigserial not null,
    user_id bigint not null,
    total integer,
    result_grade varchar(255),
    functional integer,
    emotional integer,
    catastrophic integer,
    answers TEXT,
    created_at timestamp(6),
    primary key (id)
);

create table audiometries (
    id bigserial not null,
    user_id bigint not null,
    result_type varchar(255),
    frequency float(53),
    volume integer,
    ear varchar(255),
    measured_at timestamp(6),
    primary key (id)
);

create table predictions (
    id bigserial not null,
    user_id bigint not null,
    firebase_id varchar(255),
    risk_score integer,
    risk_level varchar(255),
    predicted_window varchar(255),
    top_factors TEXT,
    prevention_actions TEXT,
    created_at timestamp(6),
    primary key (id)
);

create table voice_diaries (
    id bigserial not null,
    user_id bigint not null,
    transcript TEXT,
    emotional_state varchar(255),
    stress_score integer,
    tinnitus_worsening_risk boolean,
    recommended_sound varchar(255),
    summary TEXT,
    ai_response TEXT,
    created_at timestamp(6),
    primary key (id)
);

create table progress_notes (
    id bigserial not null,
    user_id bigint not null,
    text TEXT,
    mood varchar(255),
    note_date timestamp(6),
    ai_analysis TEXT,
    created_at timestamp(6),
    primary key (id)
);

create table content_items (
    id bigserial not null,
    type varchar(255) not null check (type in ('FAQ','TIP','ARTICLE','MESSAGE','EXERCISE')),
    title varchar(255) not null,
    summary varchar(600),
    body TEXT,
    status varchar(255) not null check (status in ('DRAFT','PUBLISHED')),
    lang varchar(10),
    tags varchar(1000),
    image_url varchar(1500),
    action_url varchar(1500),
    sort_order integer,
    version bigint,
    created_at timestamp(6),
    updated_at timestamp(6),
    primary key (id)
);

create table app_releases (
    id bigserial not null,
    version varchar(255) not null unique,
    build_code integer not null unique,
    changelog varchar(500),
    apk_filename varchar(50),
    file_size_mb float(53),
    sha256_hash varchar(255),
    force_update boolean,
    created_at timestamp(6),
    uploaded_by bigint,
    primary key (id)
);

create table download_logs (
    id bigserial not null,
    app_release bigint not null,
    user_id bigint,
    ip_hash varchar(255),
    user_agent varchar(255),
    referer varchar(255),
    platform varchar(255),
    downloaded_at timestamp(6),
    primary key (id)
);

create table jwt_tokens (
    id bigserial not null,
    token varchar(255) not null unique,
    user_id bigint,
    created_at timestamp(6),
    primary key (id)
);

alter table users add constraint fk_users_role foreign key (role_id) references roles;
alter table user_devices add constraint fk_devices_user foreign key (user_id) references users;
alter table telemetry_logs add constraint fk_telemetry_user foreign key (user_id) references users;
alter table thi_results add constraint fk_thi_user foreign key (user_id) references users;
alter table audiometries add constraint fk_audiometry_user foreign key (user_id) references users;
alter table predictions add constraint fk_prediction_user foreign key (user_id) references users;
alter table voice_diaries add constraint fk_voice_diary_user foreign key (user_id) references users;
alter table progress_notes add constraint fk_progress_note_user foreign key (user_id) references users;
alter table app_releases add constraint fk_app_release_uploader foreign key (uploaded_by) references users;
alter table download_logs add constraint fk_download_release foreign key (app_release) references app_releases;
alter table download_logs add constraint fk_download_user foreign key (user_id) references users;

-- Indices para las consultas por usuario / fecha mas comunes
create index idx_thi_user_created on thi_results (user_id, created_at desc);
create index idx_telemetry_user_timestamp on telemetry_logs (user_id, timestamp desc);
create index idx_audiometry_user_measured on audiometries (user_id, measured_at desc);
create index idx_prediction_user_created on predictions (user_id, created_at desc);
create index idx_voice_diary_user_created on voice_diaries (user_id, created_at desc);
create index idx_progress_note_user_created on progress_notes (user_id, created_at desc);
create index idx_content_status_type on content_items (status, type);
create index idx_download_release on download_logs (app_release);
