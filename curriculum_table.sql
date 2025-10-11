-- Create curriculum table with Class, Subject, Topics, and Sub-Topics columns
-- Sub-Topics will be stored as JSON

CREATE TABLE IF NOT EXISTS curriculum (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topics TEXT[] NOT NULL,
    sub_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_curriculum_class ON curriculum(class);
CREATE INDEX IF NOT EXISTS idx_curriculum_subject ON curriculum(subject);

-- Add GIN index for JSONB sub_topics for efficient JSON queries
CREATE INDEX IF NOT EXISTS idx_curriculum_sub_topics_gin ON curriculum USING GIN (sub_topics);

-- No RLS policies - table is open to everyone

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_curriculum_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row updates
CREATE TRIGGER trigger_update_curriculum_updated_at
    BEFORE UPDATE ON curriculum
    FOR EACH ROW
    EXECUTE FUNCTION update_curriculum_updated_at();

-- Insert some sample data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
(
    'JSS 1',
    'Mathematics',
    ARRAY['Numbers', 'Algebra', 'Geometry', 'Statistics'],
    '[
        {
            "Numbers": [
                "Whole Numbers",
                "Fractions",
                "Decimals",
                "Percentages"
            ]
        },
        {
            "Algebra": [
                "Basic Algebraic Expressions",
                "Linear Equations",
                "Quadratic Equations"
            ]
        },
        {
            "Geometry": [
                "Basic Shapes",
                "Angles",
                "Area and Perimeter",
                "Volume"
            ]
        },
        {
            "Statistics": [
                "Data Collection",
                "Mean, Median, Mode",
                "Graphs and Charts"
            ]
        }
    ]'::jsonb
),
(
    'JSS 2',
    'English Language',
    ARRAY['Grammar', 'Comprehension', 'Composition', 'Literature'],
    '[
        {
            "Grammar": [
                "Parts of Speech",
                "Tenses",
                "Sentence Structure",
                "Punctuation"
            ]
        },
        {
            "Comprehension": [
                "Reading Skills",
                "Vocabulary Building",
                "Inference",
                "Summary Writing"
            ]
        },
        {
            "Composition": [
                "Narrative Writing",
                "Descriptive Writing",
                "Argumentative Writing",
                "Letter Writing"
            ]
        },
        {
            "Literature": [
                "Poetry",
                "Prose",
                "Drama",
                "Literary Devices"
            ]
        }
    ]'::jsonb
);

-- Add comments for documentation
COMMENT ON TABLE curriculum IS 'Stores curriculum structure with class, subject, topics, and sub-topics - accessible by everyone';
COMMENT ON COLUMN curriculum.class IS 'Class level (e.g., JSS 1, JSS 2, SSS 1)';
COMMENT ON COLUMN curriculum.subject IS 'Subject name (e.g., Mathematics, English, Science)';
COMMENT ON COLUMN curriculum.topics IS 'Array of main topics for the subject';
COMMENT ON COLUMN curriculum.sub_topics IS 'JSON object mapping topics to their sub-topics';
