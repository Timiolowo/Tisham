-- Insert curriculum data from CSV into the curriculum table
-- This script transforms the CSV data into the proper database format

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM curriculum;

-- Insert JSS 1-3 Mathematics data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('JSS 1-3', 'Mathematics', ARRAY['Numbers, fractions, decimals, percentages'], '[{"Numbers, fractions, decimals, percentages": ["Numbers", "Fractions", "Decimals", "Percentages"]}]'::jsonb),
('JSS 1-3', 'Mathematics', ARRAY['Ratios, proportions, rates'], '[{"Ratios, proportions, rates": ["Ratios", "Proportions", "Rates"]}]'::jsonb),
('JSS 1-3', 'Mathematics', ARRAY['Geometry'], '[{"Geometry": ["Angles", "Area", "Volume"]}]'::jsonb),
('JSS 1-3', 'Mathematics', ARRAY['Algebra'], '[{"Algebra": ["Expressions", "Equations"]}]'::jsonb),
('JSS 1-3', 'Mathematics', ARRAY['Statistics'], '[{"Statistics": ["Mean", "Median", "Mode"]}]'::jsonb),
('JSS 1-3', 'Mathematics', ARRAY['Graphs'], '[{"Graphs": ["Line", "Bar", "Pie"]}]'::jsonb),
('JSS 1-3', 'Mathematics', ARRAY['Measurement'], '[{"Measurement": ["Km", "M", "Cm", "G", "Kg", "Ml", "L", "°C", "Time Zones"]}]'::jsonb);

-- Insert JSS 1-3 English data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('JSS 1-3', 'English', ARRAY['Essay writing'], '[{"Essay writing": ["Narrative", "Descriptive"]}]'::jsonb),
('JSS 1-3', 'English', ARRAY['Advanced grammar, clauses, idioms'], '[{"Advanced grammar, clauses, idioms": ["Advanced Grammar", "Clauses", "Idioms"]}]'::jsonb),
('JSS 1-3', 'English', ARRAY['Comprehension of articles, literature'], '[{"Comprehension of articles, literature": ["Comprehension Of Articles", "Literature"]}]'::jsonb),
('JSS 1-3', 'English', ARRAY['Vocabulary, academic & global terms'], '[{"Vocabulary, academic & global terms": ["Vocabulary", "Academic & Global Terms"]}]'::jsonb),
('JSS 1-3', 'English', ARRAY['Oral'], '[{"Oral": ["Debates", "Speeches", "Drama"]}]'::jsonb);

-- Insert JSS 1-3 Integrated Science data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('JSS 1-3', 'Integrated Science', ARRAY['Physics'], '[{"Physics": ["Motion", "Forces", "Energy"]}]'::jsonb),
('JSS 1-3', 'Integrated Science', ARRAY['Chemistry'], '[{"Chemistry": ["Matter", "Mixtures", "Reactions"]}]'::jsonb),
('JSS 1-3', 'Integrated Science', ARRAY['Biology'], '[{"Biology": ["Cells", "Reproduction", "Ecology"]}]'::jsonb),
('JSS 1-3', 'Integrated Science', ARRAY['Earth Science'], '[{"Earth Science": ["Climate", "Natural Resources"]}]'::jsonb),
('JSS 1-3', 'Integrated Science', ARRAY['Technology'], '[{"Technology": ["Electricity", "Mechanics"]}]'::jsonb),
('JSS 1-3', 'Integrated Science', ARRAY['Experiments & lab safety'], '[{"Experiments & lab safety": ["Experiments & Lab Safety"]}]'::jsonb);

-- Insert JSS 1-3 Digital Literacy data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('JSS 1-3', 'Digital Literacy', ARRAY['Word, Excel, PowerPoint'], '[{"Word, Excel, PowerPoint": ["Word", "Excel", "Powerpoint"]}]'::jsonb),
('JSS 1-3', 'Digital Literacy', ARRAY['Internet research & safety'], '[{"Internet research & safety": ["Internet Research & Safety"]}]'::jsonb),
('JSS 1-3', 'Digital Literacy', ARRAY['Coding (Python basics), Scratch advanced'], '[{"Coding (Python basics), Scratch advanced": ["Coding (Python Basics)", "Scratch Advanced"]}]'::jsonb);

-- Insert JSS 1-3 Social Studies data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('JSS 1-3', 'Social Studies', ARRAY['History of Nigeria, Africa'], '[{"History of Nigeria, Africa": ["History Of Nigeria", "Africa"]}]'::jsonb),
('JSS 1-3', 'Social Studies', ARRAY['Geography'], '[{"Geography": ["Maps", "Lat/Long", "Climate"]}]'::jsonb),
('JSS 1-3', 'Social Studies', ARRAY['Civics'], '[{"Civics": ["Rights", "Duties", "Democracy"]}]'::jsonb),
('JSS 1-3', 'Social Studies', ARRAY['Economics'], '[{"Economics": ["Trade", "Money", "Entrepreneurship Basics"]}]'::jsonb),
('JSS 1-3', 'Social Studies', ARRAY['Global issues'], '[{"Global issues": ["Climate Change", "Migration"]}]'::jsonb);

-- Insert JSS 1-3 Languages data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('JSS 1-3', 'Languages', ARRAY['Advanced mother tongue'], '[{"Advanced mother tongue": ["Advanced Mother Tongue"]}]'::jsonb),
('JSS 1-3', 'Languages', ARRAY['Conversational fluency in foreign language (French/Arabic)'], '[{"Conversational fluency in foreign language (French/Arabic)": ["Conversational Fluency In Foreign Language (French/Arabic)"]}]'::jsonb);

-- Insert JSS 1-3 Creative Arts data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('JSS 1-3', 'Creative Arts', ARRAY['Drawing, painting, crafts'], '[{"Drawing, painting, crafts": ["Drawing", "Painting", "Crafts"]}]'::jsonb),
('JSS 1-3', 'Creative Arts', ARRAY['Drama, theatre, film basics'], '[{"Drama, theatre, film basics": ["Drama", "Theatre", "Film Basics"]}]'::jsonb),
('JSS 1-3', 'Creative Arts', ARRAY['Music'], '[{"Music": ["Reading Notes", "Instruments"]}]'::jsonb);

-- Insert JSS 1-3 Physical & Health Education data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('JSS 1-3', 'Physical & Health Education', ARRAY['Advanced sports, fitness training'], '[{"Advanced sports, fitness training": ["Advanced Sports", "Fitness Training"]}]'::jsonb),
('JSS 1-3', 'Physical & Health Education', ARRAY['Nutrition, reproductive health'], '[{"Nutrition, reproductive health": ["Nutrition", "Reproductive Health"]}]'::jsonb),
('JSS 1-3', 'Physical & Health Education', ARRAY['First aid basics'], '[{"First aid basics": ["First Aid Basics"]}]'::jsonb),
('JSS 1-3', 'Physical & Health Education', ARRAY['Drug abuse awareness'], '[{"Drug abuse awareness": ["Drug Abuse Awareness"]}]'::jsonb);

-- Insert SS 1-3 Mathematics data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('SS 1-3', 'Mathematics', ARRAY['Algebra, functions, trigonometry'], '[{"Algebra, functions, trigonometry": ["Algebra", "Functions", "Trigonometry"]}]'::jsonb),
('SS 1-3', 'Mathematics', ARRAY['Geometry, vectors, bearings'], '[{"Geometry, vectors, bearings": ["Geometry", "Vectors", "Bearings"]}]'::jsonb),
('SS 1-3', 'Mathematics', ARRAY['Calculus, differentiation, integration basics'], '[{"Calculus, differentiation, integration basics": ["Calculus", "Differentiation", "Integration Basics"]}]'::jsonb),
('SS 1-3', 'Mathematics', ARRAY['Probability, statistics'], '[{"Probability, statistics": ["Probability", "Statistics"]}]'::jsonb),
('SS 1-3', 'Mathematics', ARRAY['Financial mathematics'], '[{"Financial mathematics": ["Financial Mathematics"]}]'::jsonb),
('SS 1-3', 'Mathematics', ARRAY['Applied mathematics in economics, engineering'], '[{"Applied mathematics in economics, engineering": ["Applied Mathematics In Economics", "Engineering"]}]'::jsonb);

-- Insert SS 1-3 English data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('SS 1-3', 'English', ARRAY['Advanced essays, academic writing'], '[{"Advanced essays, academic writing": ["Advanced Essays", "Academic Writing"]}]'::jsonb),
('SS 1-3', 'English', ARRAY['Literary analysis, world literature'], '[{"Literary analysis, world literature": ["Literary Analysis", "World Literature"]}]'::jsonb),
('SS 1-3', 'English', ARRAY['Critical reading, research skills'], '[{"Critical reading, research skills": ["Critical Reading", "Research Skills"]}]'::jsonb),
('SS 1-3', 'English', ARRAY['Public speaking, presentations'], '[{"Public speaking, presentations": ["Public Speaking", "Presentations"]}]'::jsonb),
('SS 1-3', 'English', ARRAY['Media, journalism, fact-checking'], '[{"Media, journalism, fact-checking": ["Media", "Journalism", "Fact-Checking"]}]'::jsonb);

-- Insert SS 1-3 Sciences data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('SS 1-3', 'Sciences', ARRAY['Mechanics, waves, electricity, nuclear physics'], '[{"Mechanics, waves, electricity, nuclear physics": ["Mechanics", "Waves", "Electricity", "Nuclear Physics"]}]'::jsonb),
('SS 1-3', 'Sciences', ARRAY['Chemistry'], '[{"Chemistry": ["Organic", "Inorganic", "Industrial", "Analytical"]}]'::jsonb),
('SS 1-3', 'Sciences', ARRAY['Biology'], '[{"Biology": ["Genetics", "Ecology", "Biotechnology"]}]'::jsonb),
('SS 1-3', 'Sciences', ARRAY['Earth & Environmental Science'], '[{"Earth & Environmental Science": ["Sustainability", "Climate Change"]}]'::jsonb);

-- Insert SS 1-3 Technology & Innovation data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('SS 1-3', 'Technology & Innovation', ARRAY['Data science'], '[{"Data science": ["Python", "Javascript", "Html/Css"]}]'::jsonb),
('SS 1-3', 'Technology & Innovation', ARRAY['AI & robotics intro, databases'], '[{"AI & robotics intro, databases": ["Ai & Robotics Intro", "Databases"]}]'::jsonb),
('SS 1-3', 'Technology & Innovation', ARRAY['Digital entrepreneurship, freelancing'], '[{"Digital entrepreneurship, freelancing": ["Digital Entrepreneurship", "Freelancing"]}]'::jsonb),
('SS 1-3', 'Technology & Innovation', ARRAY['Cybersecurity basics'], '[{"Cybersecurity basics": ["Cybersecurity Basics"]}]'::jsonb);

-- Insert SS 1-3 Social Sciences data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('SS 1-3', 'Social Sciences', ARRAY['Government & law, constitutions, human rights'], '[{"Government & law, constitutions, human rights": ["Government & Law", "Constitutions", "Human Rights"]}]'::jsonb),
('SS 1-3', 'Social Sciences', ARRAY['Economics'], '[{"Economics": ["Micro", "Macro", "Trade", "Globalization"]}]'::jsonb),
('SS 1-3', 'Social Sciences', ARRAY['History'], '[{"History": ["Africa", "World Revolutions", "Conflicts"]}]'::jsonb),
('SS 1-3', 'Social Sciences', ARRAY['Philosophy & ethics'], '[{"Philosophy & ethics": ["Philosophy & Ethics"]}]'::jsonb),
('SS 1-3', 'Social Sciences', ARRAY['Entrepreneurship'], '[{"Entrepreneurship": ["Business Plans", "Startups"]}]'::jsonb);

-- Insert SS 1-3 Languages data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('SS 1-3', 'Languages', ARRAY['Advanced mother tongue literature'], '[{"Advanced mother tongue literature": ["Advanced Mother Tongue Literature"]}]'::jsonb),
('SS 1-3', 'Languages', ARRAY['Fluency in international language (French/Arabic/Chinese optional)'], '[{"Fluency in international language (French/Arabic/Chinese optional)": ["Fluency In International Language (French/Arabic/Chinese Optional)"]}]'::jsonb);

-- Insert SS 1-3 Creative Arts data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('SS 1-3', 'Creative Arts', ARRAY['Fine arts, design'], '[{"Fine arts, design": ["Fine Arts", "Design"]}]'::jsonb),
('SS 1-3', 'Creative Arts', ARRAY['Music composition, instruments'], '[{"Music composition, instruments": ["Music Composition", "Instruments"]}]'::jsonb),
('SS 1-3', 'Creative Arts', ARRAY['Drama & theatre'], '[{"Drama & theatre": ["Drama & Theatre"]}]'::jsonb),
('SS 1-3', 'Creative Arts', ARRAY['Film/media production'], '[{"Film/media production": ["Film/Media Production"]}]'::jsonb);

-- Insert SS 1-3 Physical & Health Education data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('SS 1-3', 'Physical & Health Education', ARRAY['Professional-level sports training'], '[{"Professional-level sports training": ["Professional-Level Sports Training"]}]'::jsonb),
('SS 1-3', 'Physical & Health Education', ARRAY['Health science, mental health'], '[{"Health science, mental health": ["Health Science", "Mental Health"]}]'::jsonb),
('SS 1-3', 'Physical & Health Education', ARRAY['Advanced first aid & CPR'], '[{"Advanced first aid & CPR": ["Advanced First Aid & Cpr"]}]'::jsonb),
('SS 1-3', 'Physical & Health Education', ARRAY['Personal development, leadership'], '[{"Personal development, leadership": ["Personal Development", "Leadership"]}]'::jsonb);

-- Insert SS 1-3 Research & Project data
INSERT INTO curriculum (class, subject, topics, sub_topics) VALUES
('SS 1-3', 'Research & Project', ARRAY['Final-year project work'], '[{"Final-year project work": ["Final-Year Project Work"]}]'::jsonb),
('SS 1-3', 'Research & Project', ARRAY['Hypothesis, data collection, analysis'], '[{"Hypothesis, data collection, analysis": ["Hypothesis", "Data Collection", "Analysis"]}]'::jsonb),
('SS 1-3', 'Research & Project', ARRAY['Project presentation & defense'], '[{"Project presentation & defense": ["Project Presentation & Defense"]}]'::jsonb);

-- Verify the data was inserted correctly
SELECT 
    class,
    subject,
    topics,
    sub_topics
FROM curriculum 
ORDER BY class, subject, topics;
