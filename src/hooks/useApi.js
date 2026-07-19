import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useApi(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define endpoints that should return a single object instead of an array
  const isSingleton = endpoint === 'settings' || endpoint === 'stats';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // If supabase client is not available, set empty data
      if (!supabase) {
        console.warn(`Supabase not initialized. Cannot fetch ${endpoint}.`);
        setData(isSingleton ? {} : []);
        setLoading(false);
        return;
      }

      // We no longer rely on stats from backend as we compute it dynamically
      if (endpoint === 'stats') {
        setData({});
        setLoading(false);
        return;
      }

      const tableName = endpoint.toLowerCase();
      let query = supabase.from(tableName).select('*');
      
      // Order collections by created_at, but not singletons
      if (!isSingleton) {
        query = query.order('created_at', { ascending: false });
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      if (isSingleton) {
        setData(result && result.length > 0 ? result[0] : null);
      } else {
        setData(result);
      }
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setError(err.message);
      // Set fallback data so the UI still renders
      setData(isSingleton ? {} : []);
    } finally {
      setLoading(false);
    }
  }, [endpoint, isSingleton]);

  useEffect(() => {
    fetchData();

    const handleRefetch = () => {
      fetchData();
    };

    window.addEventListener('refetch-data', handleRefetch);
    return () => {
      window.removeEventListener('refetch-data', handleRefetch);
    };
  }, [fetchData]);

  const updateItem = async (id, updates) => {
    try {
      if (!supabase) throw new Error('Supabase is not connected. Please check your environment variables.');
      const tableName = endpoint.toLowerCase();
      
      let currentUpdates = { ...updates };
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        attempts++;
        let query = supabase.from(tableName).update(currentUpdates);
        
        if (id) {
          query = query.eq('id', id);
        } else if (isSingleton && data?.id) {
          query = query.eq('id', data.id);
        } else {
          throw new Error('Update requires an ID');
        }

        const { data: updatedItem, error: updateError } = await query.select().single();
        
        if (updateError) {
          // If column doesn't exist, strip it and retry
          const colMatch = updateError.message?.match(/Could not find the '(\w+)' column/i) 
            || updateError.message?.match(/column "(\w+)" of relation/i);
          if (colMatch && attempts < maxAttempts) {
            const badCol = colMatch[1];
            console.warn(`Column '${badCol}' not found in '${tableName}', retrying without it.`);
            const { [badCol]: _, ...cleanUpdates } = currentUpdates;
            currentUpdates = cleanUpdates;
            if (Object.keys(currentUpdates).length === 0) {
              // Nothing left to update, just return existing data
              return null;
            }
            continue;
          }
          throw updateError;
        }
        
        if (id) {
          setData(prev => prev.map(item => item.id === id ? updatedItem : item));
        } else {
          setData(updatedItem);
        }
        
        return updatedItem;
      }
    } catch (err) {
      console.error('Update error:', err);
      throw err;
    }
  };

  const addItem = async (newItem) => {
    try {
      if (!supabase) throw new Error('Supabase is not connected. Please check your environment variables.');
      const tableName = endpoint.toLowerCase();
      
      let currentItem = { ...newItem };
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        attempts++;
        const { data: addedItem, error: addError } = await supabase
          .from(tableName)
          .insert([currentItem])
          .select()
          .single();
        
        if (addError) {
          const colMatch = addError.message?.match(/Could not find the '(\w+)' column/i) 
            || addError.message?.match(/column "(\w+)" of relation/i);
          if (colMatch && attempts < maxAttempts) {
            const badCol = colMatch[1];
            console.warn(`Column '${badCol}' not found in '${tableName}', retrying without it.`);
            const { [badCol]: _, ...cleanItem } = currentItem;
            currentItem = cleanItem;
            continue;
          }
          throw addError;
        }
        
        setData(prev => {
          if (!prev) return [addedItem];
          return [addedItem, ...prev];
        });
        return addedItem;
      }
    } catch (err) {
      console.error('Add error:', err);
      throw err;
    }
  };
  
  const deleteItem = async (id) => {
    try {
      if (!supabase) throw new Error('Supabase is not connected. Please check your environment variables.');
      const tableName = endpoint.toLowerCase();
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      throw err;
    }
  };

  return { data, loading, error, updateItem, addItem, deleteItem, refetch: fetchData };
}
