/**
 * Curriculum Data Service
 * Provides curriculum data from local JSON file or Supabase
 */

import { supabase } from './supabase';
import { EMBEDDED_CURRICULUM_DATA } from './curriculum-data';

// Import curriculum data dynamically to avoid build issues
let curriculumData: any[] = [];

// Load curriculum data
const loadCurriculumData = async () => {
  if (curriculumData.length === 0) {
    try {
      // Try to load from public folder first (works in production)
      const response = await fetch('/data/curriculum.json');
      if (response.ok) {
        curriculumData = await response.json();
      } else {
        throw new Error('Failed to load from public folder');
      }
    } catch (error) {
      console.warn('Failed to load curriculum data from public folder, using embedded data:', error);
      curriculumData = EMBEDDED_CURRICULUM_DATA;
    }
  }
  return curriculumData;
};

export interface Curriculum {
  id: string;
  class: string;
  subject: string;
  topics: string[];
  sub_topics: any;
  created_at: string;
  updated_at: string;
}

// Helper function to map user-selected class to curriculum class
export const getCurriculumClass = (selectedClass: string): string => {
  if (selectedClass.startsWith('JSS')) {
    return 'JSS 1-3';
  } else if (selectedClass.startsWith('SS')) {
    return 'SS 1-3';
  }
  return selectedClass;
};

// Configuration: Set to true to use local data, false to use Supabase
const USE_LOCAL_DATA = true;

/**
 * Get all curriculum data
 * Uses local data if USE_LOCAL_DATA is true, otherwise fetches from Supabase
 */
export async function getAllCurriculum(): Promise<Curriculum[]> {
  if (USE_LOCAL_DATA) {
    const data = await loadCurriculumData();
    return data as Curriculum[];
  }

  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('User not authenticated:', authError);
    throw new Error('Authentication required to access curriculum data');
  }
  
  
  const { data, error } = await supabase
    .from('curriculum')
    .select('*')
    .order('class', { ascending: true });

  if (error) {
    console.error('Error fetching curriculum:', error);
    return [];
  }

  return data || [];
}

/**
 * Get subjects for a specific class level
 */
export async function getSubjectsByClass(classLevel: string): Promise<string[]> {
  const curriculumClass = getCurriculumClass(classLevel);
  
  
  if (USE_LOCAL_DATA) {
    const allData = await loadCurriculumData();
    const subjects = allData
      .filter(item => item.class === curriculumClass)
      .map(item => item.subject);
    
    const uniqueSubjects = [...new Set(subjects)];
    return uniqueSubjects;
  }

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('User not authenticated:', authError);
    throw new Error('Authentication required to access curriculum data');
  }
  
  const { data, error } = await supabase
    .from('curriculum')
    .select('subject')
    .eq('class', curriculumClass);

  if (error) {
    console.error('Error fetching subjects for class:', error);
    return [];
  }


  // Extract unique subjects
  const subjects = [...new Set(data?.map(item => item.subject) || [])];
  return subjects;
}

/**
 * Get topics for a specific subject and class level
 */
export async function getTopicsBySubject(classLevel: string, subject: string): Promise<string[]> {
  const curriculumClass = getCurriculumClass(classLevel);
  
  
  if (USE_LOCAL_DATA) {
    const allData = await loadCurriculumData();
    const subjectRecords = allData.filter(item => 
      item.class === curriculumClass && item.subject === subject
    );
    
    if (subjectRecords.length > 0) {
      // Extract topics from all records for this subject
      const topics = subjectRecords.flatMap(record => record.topics);
      return topics;
    }
    
    return [];
  }

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('User not authenticated:', authError);
    throw new Error('Authentication required to access curriculum data');
  }
  
  const { data, error } = await supabase
    .from('curriculum')
    .select('topics')
    .eq('class', curriculumClass)
    .eq('subject', subject);

  if (error) {
    console.error('Error fetching topics for subject:', error);
    return [];
  }

  // Extract topics from all records for this subject
  const topics = data?.flatMap(record => record.topics) || [];
  return topics;
}

/**
 * Test curriculum table access (only works with Supabase)
 */
export async function testCurriculumTableAccess(): Promise<{success: boolean, error?: string, data?: any}> {
  if (USE_LOCAL_DATA) {
    return {
      success: true,
      data: curriculumData,
      error: 'Using local data - Supabase test not applicable'
    };
  }

  try {
    
    // Try a simple count query first
    const { count, error: countError } = await supabase
      .from('curriculum')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Count query failed:', countError);
      return { success: false, error: `Count query failed: ${countError.message}` };
    }
    
    
    // Try to fetch one record
    const { data, error } = await supabase
      .from('curriculum')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Select query failed:', error);
      return { success: false, error: `Select query failed: ${error.message}` };
    }
    
    return { success: true, data: data };
    
  } catch (err) {
    console.error('Unexpected error testing table access:', err);
    return { success: false, error: `Unexpected error: ${String(err)}` };
  }
}
