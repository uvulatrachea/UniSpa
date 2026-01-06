CREATE USER IF NOT EXISTS 'sail'@'%' IDENTIFIED BY 'password';
CREATE USER IF NOT EXISTS 'sail'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON unispa.* TO 'sail'@'%';
GRANT ALL PRIVILEGES ON unispa.* TO 'sail'@'localhost';
FLUSH PRIVILEGES;
SELECT 'User created successfully' as Message;
