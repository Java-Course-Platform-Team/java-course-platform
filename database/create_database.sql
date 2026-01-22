DROP TABLE IF EXISTS tb_users, tb_courses, tb_categories, tb_modules, tb_lessons, tb_attachments, tb_orders, tb_order_items, tb_enrollments, tb_progress, tb_reviews, tb_certificates CASCADE;

-- 1. TABELA DE USUÁRIOS (Com CPF)
CREATE TABLE tb_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    cpf VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'STUDENT',
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE CATEGORIAS
CREATE TABLE tb_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE CURSOS
CREATE TABLE tb_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    image_url VARCHAR(255),
    category VARCHAR(255),
    status VARCHAR(20) DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE MÓDULOS
CREATE TABLE tb_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    course_id UUID REFERENCES tb_courses(id) ON DELETE CASCADE,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA DE AULAS
CREATE TABLE tb_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    video_url TEXT NOT NULL,
    description TEXT,
    duration_seconds INTEGER DEFAULT 0,
    module_id UUID REFERENCES tb_modules(id) ON DELETE CASCADE,
    "order" INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. MATERIAIS DE APOIO
CREATE TABLE tb_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    lesson_id UUID REFERENCES tb_lessons(id) ON DELETE CASCADE
);

-- 7. PEDIDOS
CREATE TABLE tb_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES tb_users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. ITENS DO PEDIDO
CREATE TABLE tb_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES tb_orders(id) ON DELETE CASCADE,
    course_id UUID REFERENCES tb_courses(id),
    price_at_purchase DECIMAL(10, 2) NOT NULL
);

-- 9. MATRÍCULAS
CREATE TABLE tb_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES tb_users(id),
    course_id UUID REFERENCES tb_courses(id),
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    expiration_date TIMESTAMP
);

-- 10. PROGRESSO
CREATE TABLE tb_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES tb_users(id),
    lesson_id UUID REFERENCES tb_lessons(id),
    is_completed BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- 11. AVALIAÇÕES
CREATE TABLE tb_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES tb_users(id),
    course_id UUID REFERENCES tb_courses(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. CERTIFICADOS
CREATE TABLE tb_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES tb_users(id),
    course_id UUID REFERENCES tb_courses(id),
    verification_code VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);