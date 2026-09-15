-- V2: La entidad AppRelease tiene un @ManyToOne a User (uploadedBy) mapeado a la
-- columna uploaded_by, la cual no existía en el esquema base V1. Se agrega aquí
-- para no alterar la migración base ya aplicada en producción.
ALTER TABLE app_releases ADD COLUMN uploaded_by BIGINT;
ALTER TABLE app_releases ADD CONSTRAINT fk_app_release_uploader
    FOREIGN KEY (uploaded_by) REFERENCES users(id);
