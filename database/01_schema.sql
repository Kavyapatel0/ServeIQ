CREATE DATABASE restaurant_bi_platform;
USE restaurant_bi_platform;

CREATE TABLE Roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    permission_key VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Role_Permissions (
    role_id BIGINT,
    permission_id BIGINT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES Roles(id),
    FOREIGN KEY (permission_id) REFERENCES Permissions(id)
);

CREATE TABLE Branches (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL
);

CREATE TABLE Users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT,
    branch_id BIGINT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(id),
    FOREIGN KEY (branch_id) REFERENCES Branches(id)
);


CREATE TABLE Customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Restaurant_Tables (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    table_number VARCHAR(20) NOT NULL,
    capacity INT NOT NULL,
    branch_id BIGINT NOT NULL,
    status ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING') DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES Branches(id),
    INDEX (branch_id),
    INDEX (status)
);

CREATE TABLE Orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT,
    branch_id BIGINT,
    table_id BIGINT,
    created_by BIGINT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('CREATED', 'PREPARING', 'READY', 'SERVED', 'PAID', 'COMPLETED', 'CANCELLED') NOT NULL,
    subtotal DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    grand_total DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id),
    FOREIGN KEY (branch_id) REFERENCES Branches(id),
    FOREIGN KEY (table_id) REFERENCES Restaurant_Tables(id),
    FOREIGN KEY (created_by) REFERENCES Users(id),
    INDEX(customer_id),
    INDEX(branch_id),
    INDEX(order_date),
    INDEX(status)
);

CREATE TABLE Payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('CASH', 'CARD', 'UPI', 'WALLET') NOT NULL,
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(id)
);

CREATE TABLE Kitchen_Orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    status ENUM('PENDING', 'PREPARING', 'READY', 'SERVED') NOT NULL DEFAULT 'PENDING',
    assigned_chef BIGINT,
    notes VARCHAR(255),
    started_at TIMESTAMP NULL,
    ready_at TIMESTAMP NULL,
    served_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(id),
    FOREIGN KEY (branch_id) REFERENCES Branches(id),
    FOREIGN KEY (assigned_chef) REFERENCES Users(id),
    INDEX (branch_id),
    INDEX (status),
    INDEX (created_at)
);



CREATE TABLE Menu_Categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Menu_Items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id BIGINT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    selling_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Menu_Categories(id)
);

CREATE TABLE Order_Items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT,
    menu_item_id BIGINT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES Menu_Items(id)
);

CREATE TABLE Suppliers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    gst_number VARCHAR(20),
    address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (name),
    INDEX (is_active)
);

CREATE TABLE Ingredients (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    current_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
    minimum_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    supplier_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(id),
    INDEX (name),
    INDEX (is_active)
);

CREATE TABLE Recipes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    menu_item_id BIGINT,
    ingredient_id BIGINT,
    quantity_required DECIMAL(10, 2) NOT NULL,
    UNIQUE(menu_item_id, ingredient_id),
    FOREIGN KEY (menu_item_id) REFERENCES Menu_Items(id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id)
);



CREATE TABLE Inventory_Transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ingredient_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantity DECIMAL(10, 2) NOT NULL,
    transaction_type ENUM('PURCHASE', 'ADJUSTMENT') NOT NULL,
    reference_id BIGINT,
    reference_type ENUM('PURCHASE_ORDER', 'MANUAL_ADJUSTMENT') NOT NULL,
    notes VARCHAR(255),
    created_by BIGINT,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id),
    FOREIGN KEY (branch_id) REFERENCES Branches(id),
    FOREIGN KEY (created_by) REFERENCES Users(id),
    INDEX(ingredient_id),
    INDEX(branch_id),
    INDEX(transaction_date),
    INDEX(transaction_type)
);

CREATE TABLE Branch_Inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    branch_id BIGINT,
    ingredient_id BIGINT,
    current_stock DECIMAL(10, 2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(branch_id, ingredient_id),
    FOREIGN KEY (branch_id) REFERENCES Branches(id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id)
);

CREATE TABLE Purchase_Orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    status ENUM('PENDING', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    received_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(id),
    FOREIGN KEY (branch_id) REFERENCES Branches(id),
    FOREIGN KEY (created_by) REFERENCES Users(id),
    INDEX (supplier_id),
    INDEX (branch_id),
    INDEX (status),
    INDEX (order_date)
);

CREATE TABLE Purchase_Order_Items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    purchase_order_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (purchase_order_id) REFERENCES Purchase_Orders(id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id),
    INDEX (purchase_order_id)
);



CREATE TABLE Loyalty_Transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT,
    points INT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_type ENUM('EARNED', 'REDEEMED', 'EXPIRED') NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customers(id)
);

CREATE TABLE Coupons (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount DECIMAL(5, 2) NOT NULL,
    discount_type ENUM('PERCENTAGE', 'FIXED') NOT NULL,
    valid_from DATE,
    valid_to DATE,
    minimum_order_amount DECIMAL(10,2),
    max_usage INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Coupon_Usage (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT,
    coupon_id BIGINT,
    usage_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id),
    FOREIGN KEY (coupon_id) REFERENCES Coupons(id)
);

CREATE TABLE Taxes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tax_name VARCHAR(100) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL
);

CREATE TABLE Branch_Menu_Items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    branch_id BIGINT,
    menu_item_id BIGINT,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (branch_id) REFERENCES Branches(id),
    FOREIGN KEY (menu_item_id) REFERENCES Menu_Items(id),
    INDEX(branch_id),
    INDEX(menu_item_id)
);

CREATE TABLE Audit_Logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    INDEX(user_id),
    INDEX(entity_type),
    INDEX(created_at)
);