-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE vendor_type AS ENUM ('item', 'service', 'both');
CREATE TYPE order_type AS ENUM ('item', 'service');
CREATE TYPE order_status AS ENUM ('pending', 'approved', 'delivered', 'completed');
CREATE TYPE document_type AS ENUM ('proforma', 'delivery_note', 'payment_statement', 'receipt', 'job_card', 'diagnosis');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'delivered', 'paid');

-- Create tables
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    address TEXT,
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    credit_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    type vendor_type NOT NULL DEFAULT 'item',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    buy_price DECIMAL(15,2) NOT NULL,
    sell_price DECIMAL(15,2) NOT NULL,
    stock_qty INTEGER DEFAULT 0,
    warranty VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    cost DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type order_type NOT NULL,
    total_amount DECIMAL(15,2) DEFAULT 0.00,
    status order_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    type document_type NOT NULL,
    status document_status DEFAULT 'pending',
    due_date DATE,
    file_path TEXT,
    document_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount_paid DECIMAL(15,2) NOT NULL,
    balance DECIMAL(15,2) GENERATED ALWAYS AS (
        (SELECT total_amount FROM orders WHERE id = order_id) - amount_paid
    ) STORED,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    service_ids JSONB DEFAULT '[]',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_items_vendor ON items(vendor_id);
CREATE INDEX idx_services_vendor ON services(vendor_id);
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_details_order ON order_details(order_id);
CREATE INDEX idx_documents_order ON documents(order_id);
CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_order ON payments(order_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON technicians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create document numbering function
CREATE OR REPLACE FUNCTION generate_document_number(doc_type document_type)
RETURNS VARCHAR(50) AS $$
DECLARE
    year_prefix VARCHAR(4);
    sequence_num INTEGER;
    doc_number VARCHAR(50);
BEGIN
    year_prefix := EXTRACT(YEAR FROM NOW())::VARCHAR;
    
    -- Get the next sequence number for this document type and year
    SELECT COALESCE(MAX(CAST(SUBSTRING(document_number FROM 9) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM documents 
    WHERE document_number LIKE doc_type || '/' || year_prefix || '/%';
    
    doc_number := doc_type || '/' || year_prefix || '/' || LPAD(sequence_num::VARCHAR, 4, '0');
    
    RETURN doc_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate document numbers
CREATE OR REPLACE FUNCTION auto_generate_document_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.document_number IS NULL THEN
        NEW.document_number := generate_document_number(NEW.type);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_document_number
    BEFORE INSERT ON documents
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_document_number();

-- Create function to update order total amount
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders 
    SET total_amount = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM order_details 
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update order total when order details change
CREATE TRIGGER trigger_update_order_total
    AFTER INSERT OR UPDATE OR DELETE ON order_details
    FOR EACH ROW
    EXECUTE FUNCTION update_order_total();

-- Create function to check credit limit before order approval
CREATE OR REPLACE FUNCTION check_credit_limit()
RETURNS TRIGGER AS $$
DECLARE
    client_credit_limit DECIMAL(15,2);
    current_balance DECIMAL(15,2);
    order_total DECIMAL(15,2);
BEGIN
    IF NEW.status = 'approved' THEN
        -- Get client credit limit
        SELECT credit_limit INTO client_credit_limit
        FROM clients WHERE id = NEW.client_id;
        
        -- Get current outstanding balance
        SELECT COALESCE(SUM(total_amount), 0) INTO current_balance
        FROM orders 
        WHERE client_id = NEW.client_id 
        AND status IN ('approved', 'delivered')
        AND id != NEW.id;
        
        -- Get this order's total
        order_total := NEW.total_amount;
        
        -- Check if order would exceed credit limit
        IF (current_balance + order_total) > client_credit_limit THEN
            RAISE EXCEPTION 'Order would exceed client credit limit of %', client_credit_limit;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check credit limit
CREATE TRIGGER trigger_check_credit_limit
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION check_credit_limit();

-- Create function to auto-generate next document when proforma is approved
CREATE OR REPLACE FUNCTION auto_generate_next_document()
RETURNS TRIGGER AS $$
DECLARE
    order_record RECORD;
    next_doc_type document_type;
    next_doc_status document_status;
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        -- Get order details
        SELECT * INTO order_record FROM orders WHERE id = NEW.order_id;
        
        -- Determine next document type based on current document type
        CASE NEW.type
            WHEN 'proforma' THEN
                IF order_record.type = 'item' THEN
                    next_doc_type := 'delivery_note';
                    next_doc_status := 'pending';
                ELSE
                    next_doc_type := 'job_card';
                    next_doc_status := 'pending';
                END IF;
            WHEN 'delivery_note' THEN
                next_doc_type := 'payment_statement';
                next_doc_status := 'pending';
            WHEN 'job_card' THEN
                next_doc_type := 'delivery_note';
                next_doc_status := 'pending';
            ELSE
                RETURN NEW;
        END CASE;
        
        -- Insert next document
        INSERT INTO documents (order_id, client_id, vendor_id, type, status, due_date)
        VALUES (
            NEW.order_id,
            NEW.client_id,
            NEW.vendor_id,
            next_doc_type,
            next_doc_status,
            CASE 
                WHEN next_doc_type = 'payment_statement' THEN 
                    NOW() + INTERVAL '30 days'
                ELSE NULL
            END
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate next document
CREATE TRIGGER trigger_auto_generate_next_document
    AFTER UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_next_document();

-- Create function to update stock when delivery note is confirmed
CREATE OR REPLACE FUNCTION update_stock_on_delivery()
RETURNS TRIGGER AS $$
DECLARE
    order_record RECORD;
    order_detail RECORD;
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.type = 'delivery_note' THEN
        -- Get order details
        SELECT * INTO order_record FROM orders WHERE id = NEW.order_id;
        
        -- Only update stock for item orders
        IF order_record.type = 'item' THEN
            -- Update stock for each item in the order
            FOR order_detail IN 
                SELECT od.item_id, od.quantity 
                FROM order_details od 
                WHERE od.order_id = NEW.order_id AND od.item_id IS NOT NULL
            LOOP
                UPDATE items 
                SET stock_qty = stock_qty - order_detail.quantity
                WHERE id = order_detail.item_id;
            END LOOP;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stock on delivery
CREATE TRIGGER trigger_update_stock_on_delivery
    AFTER UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_next_document();

-- Create function to generate receipt when payment is recorded
CREATE OR REPLACE FUNCTION generate_receipt_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    order_record RECORD;
    existing_receipt UUID;
BEGIN
    -- Check if this payment completes the order
    SELECT * INTO order_record FROM orders WHERE id = NEW.order_id;
    
    IF NEW.balance <= 0 THEN
        -- Check if receipt already exists
        SELECT id INTO existing_receipt 
        FROM documents 
        WHERE order_id = NEW.order_id AND type = 'receipt';
        
        -- Generate receipt if it doesn't exist
        IF existing_receipt IS NULL THEN
            INSERT INTO documents (order_id, client_id, vendor_id, type, status)
            VALUES (NEW.order_id, NEW.client_id, NULL, 'receipt', 'paid');
        END IF;
        
        -- Update order status to completed
        UPDATE orders SET status = 'completed' WHERE id = NEW.order_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to generate receipt on payment
CREATE TRIGGER trigger_generate_receipt_on_payment
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION generate_receipt_on_payment();

-- Create function to auto-assign technician for service orders
CREATE OR REPLACE FUNCTION auto_assign_technician()
RETURNS TRIGGER AS $$
DECLARE
    technician_record RECORD;
    service_record RECORD;
BEGIN
    IF NEW.type = 'job_card' AND NEW.status = 'pending' THEN
        -- Get the service details from the order
        SELECT s.* INTO service_record
        FROM services s
        JOIN order_details od ON s.id = od.service_id
        JOIN orders o ON od.order_id = o.id
        WHERE o.id = NEW.order_id
        LIMIT 1;
        
        IF service_record.vendor_id IS NOT NULL THEN
            -- Find available technician for this service
            SELECT t.* INTO technician_record
            FROM technicians t
            WHERE t.is_available = true
            AND (t.service_ids @> jsonb_build_array(service_record.id::text) OR t.service_ids = '[]')
            LIMIT 1;
            
            -- Update technician availability
            IF technician_record.id IS NOT NULL THEN
                UPDATE technicians 
                SET is_available = false 
                WHERE id = technician_record.id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign technician
CREATE TRIGGER trigger_auto_assign_technician
    AFTER INSERT ON documents
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_technician();

-- Create views for business intelligence
CREATE VIEW client_summary AS
SELECT 
    c.id,
    c.name,
    c.contact,
    c.credit_limit,
    c.credit_days,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(CASE WHEN o.status IN ('pending', 'approved', 'delivered') THEN o.total_amount ELSE 0 END), 0) as outstanding_balance,
    COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
    MAX(o.created_at) as last_order_date
FROM clients c
LEFT JOIN orders o ON c.id = o.client_id
GROUP BY c.id, c.name, c.contact, c.credit_limit, c.credit_days;

CREATE VIEW vendor_performance AS
SELECT 
    v.id,
    v.name,
    v.type,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
    AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END) as avg_order_value,
    COUNT(DISTINCT i.id) as total_items,
    COUNT(DISTINCT s.id) as total_services
FROM vendors v
LEFT JOIN items i ON v.id = i.vendor_id
LEFT JOIN services s ON v.id = s.vendor_id
LEFT JOIN order_details od ON (i.id = od.item_id OR s.id = od.service_id)
LEFT JOIN orders o ON od.order_id = o.id
GROUP BY v.id, v.name, v.type;

CREATE VIEW inventory_status AS
SELECT 
    i.id,
    i.name,
    v.name as vendor_name,
    i.stock_qty,
    i.buy_price,
    i.sell_price,
    (i.sell_price - i.buy_price) as profit_margin,
    CASE 
        WHEN i.stock_qty = 0 THEN 'Out of Stock'
        WHEN i.stock_qty <= 5 THEN 'Low Stock'
        ELSE 'In Stock'
    END as stock_status
FROM items i
LEFT JOIN vendors v ON i.vendor_id = v.id
ORDER BY i.stock_qty ASC;

-- Insert sample data for testing
INSERT INTO clients (name, contact, address, credit_limit, credit_days) VALUES
('ABC Company Ltd', '+1234567890', '123 Business St, City', 10000.00, 30),
('XYZ Corporation', '+0987654321', '456 Corporate Ave, Town', 15000.00, 45),
('Tech Solutions Inc', '+1122334455', '789 Tech Blvd, District', 5000.00, 15);

INSERT INTO vendors (name, contact, type) VALUES
('Tech Supplies Co', '+1112223333', 'item'),
('IT Services Ltd', '+4445556666', 'service'),
('Computer Parts Inc', '+7778889999', 'both');

INSERT INTO items (name, vendor_id, buy_price, sell_price, stock_qty, warranty) VALUES
('Laptop Dell XPS 13', (SELECT id FROM vendors WHERE name = 'Tech Supplies Co'), 800.00, 1200.00, 10, '2 years'),
('Wireless Mouse', (SELECT id FROM vendors WHERE name = 'Computer Parts Inc'), 15.00, 25.00, 50, '1 year'),
('USB Cable', (SELECT id FROM vendors WHERE name = 'Computer Parts Inc'), 2.00, 5.00, 100, '6 months');

INSERT INTO services (name, vendor_id, cost) VALUES
('Network Setup', (SELECT id FROM vendors WHERE name = 'IT Services Ltd'), 150.00),
('Computer Repair', (SELECT id FROM vendors WHERE name = 'IT Services Ltd'), 80.00),
('Data Recovery', (SELECT id FROM vendors WHERE name = 'IT Services Ltd'), 200.00);

INSERT INTO technicians (name, contact, service_ids) VALUES
('John Smith', '+1234567890', '["1", "2"]'),
('Jane Doe', '+0987654321', '["2", "3"]'),
('Mike Johnson', '+1122334455', '["1", "3"]'); 