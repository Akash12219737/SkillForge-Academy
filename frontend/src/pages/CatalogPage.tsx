import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Star, SlidersHorizontal, BookOpen, Layers, Award, Clock } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import api from '../services/api';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Catalog states
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter selections
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || '');
  const [selectedRating, setSelectedRating] = useState(searchParams.get('rating') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Sync state with URL params
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedLevel(searchParams.get('level') || '');
    setSelectedRating(searchParams.get('rating') || '');
    setPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/courses/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch catalog courses when parameters change
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const params: any = { page };
        if (search) params.search = search;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedLevel) params.level = selectedLevel;
        if (selectedRating) params.rating = selectedRating;

        const res = await api.get('/courses', { params });
        setCourses(res.data.courses || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1 });
      } catch (err) {
        console.error('Error loading courses:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [search, selectedCategory, selectedLevel, selectedRating, page]);

  const updateFilters = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to first page
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedRating('');
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Curriculum Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">Explore structured courses led by industry subject matter experts</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Search bar inputs */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateFilters('search', search);
                }
              }}
            />
          </div>
          <Button variant="primary" onClick={() => updateFilters('search', search)}>Search</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters Sidebar */}
        <div className="col-span-1 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-foreground font-bold">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span>Filters</span>
            </div>
            <button onClick={resetFilters} className="text-xs text-primary hover:underline font-semibold">
              Clear All
            </button>
          </div>

          {/* Category Select Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
            <Select
              value={selectedCategory}
              onChange={(e) => updateFilters('category', e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map((c) => ({ value: c.slug, label: c.name })),
              ]}
            />
          </div>

          {/* Level Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skill Level</label>
            <Select
              value={selectedLevel}
              onChange={(e) => updateFilters('level', e.target.value)}
              options={[
                { value: '', label: 'All Levels' },
                { value: 'BEGINNER', label: 'Beginner' },
                { value: 'INTERMEDIATE', label: 'Intermediate' },
                { value: 'ADVANCED', label: 'Advanced' },
              ]}
            />
          </div>

          {/* Rating filter select */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Minimum Rating</label>
            <Select
              value={selectedRating}
              onChange={(e) => updateFilters('rating', e.target.value)}
              options={[
                { value: '', label: 'All Ratings' },
                { value: '4.8', label: '4.8 ★ & Above' },
                { value: '4.5', label: '4.5 ★ & Above' },
                { value: '4.0', label: '4.0 ★ & Above' },
              ]}
            />
          </div>
        </div>

        {/* Main Courses list container */}
        <div className="col-span-1 lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="flex flex-col space-y-3">
                  <Skeleton className="h-44 w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-1/4" />
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-bold text-foreground">No courses found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                We couldn't find any courses matching your search criteria. Try modifying your filter settings.
              </p>
              <Button variant="outline" onClick={resetFilters}>Reset All Filters</Button>
            </div>
          ) : (
            <>
              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    className="flex flex-col h-full overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-blue-500/50 group"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
                        alt={course.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-slate-900/80 text-white border-0 backdrop-blur-sm">
                          {course.level}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="flex-1 p-5 flex flex-col justify-between text-left space-y-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">
                          {course.category?.name || 'DevOps'}
                        </span>
                        <h3 className="font-bold text-foreground text-sm md:text-base leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {course.subtitle}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img
                            src={course.instructor?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg'}
                            alt={course.instructor?.name}
                            className="h-6 w-6 rounded-full bg-slate-100"
                          />
                          <span className="text-xs text-muted-foreground font-semibold truncate max-w-[100px]">
                            {course.instructor?.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="text-xs font-bold text-foreground">{course.rating}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-lg font-black text-slate-900 dark:text-white">${course.price}</span>
                        <Link to={`/courses/${course.id}`}>
                          <Button size="sm" variant="gradient">Learn More</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => {
                      const newPage = page - 1;
                      setPage(newPage);
                      updateFilters('page', newPage.toString());
                    }}
                  >
                    Previous
                  </Button>
                  <div className="text-sm font-semibold text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => {
                      const newPage = page + 1;
                      setPage(newPage);
                      updateFilters('page', newPage.toString());
                    }}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
