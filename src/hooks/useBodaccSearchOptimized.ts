@@ .. @@
 import { useState, useCallback } from 'react';
+import { useDebounce } from './useDebounce';
+import { useCache } from './useCache';
 import { BodaccAnnouncement, SearchFilters, ApiResponse } from '../types/bodacc';
 import { BodaccApiService } from '../services/bodaccApi';

 export function useBodaccData() {
   const [announcements, setAnnouncements] = useState<BodaccAnnouncement[]>([]);
   const [totalCount, setTotalCount] = useState(0);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
+  const [progress, setProgress] = useState(0);
+  
+  const cache = useCache<ApiResponse>({ ttl: 5 * 60 * 1000 }); // 5 minutes cache
   
   const loadAnnouncements = useCallback(async (filters: SearchFilters) => {
+    // Generate cache key from filters
+    const cacheKey = JSON.stringify(filters);
+    
     setIsLoading(true);
     setError(null);
+    setProgress(10);
     
     try {
+      setProgress(30);
+      
+      // Try to get from cache first
+      const response = await cache.fetchWithCache(cacheKey, async () => {
+        setProgress(60);
+        return await BodaccApiService.getAnnouncements(filters);
+      });
+      
+      setProgress(90);
-      const response = await BodaccApiService.getAnnouncements(filters);
       setAnnouncements(response.results);
       setTotalCount(response.total_count);
+      setProgress(100);
     } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
       setError(errorMessage);
       setAnnouncements([]);
       setTotalCount(0);
+      setProgress(0);
     } finally {
       setIsLoading(false);
+      // Reset progress after a delay
+      setTimeout(() => setProgress(0), 1000);
     }
   }, []);

   const clearError = useCallback(() => {
     setError(null);
   }, []);

+  const clearCache = useCallback(() => {
+    cache.clear();
+  }, [cache]);

   return {
     announcements,
     totalCount,
     isLoading,
     error,
+    progress,
     loadAnnouncements,
-    clearError
+    clearError,
+    clearCache,
+    cacheSize: cache.size
   };
 }