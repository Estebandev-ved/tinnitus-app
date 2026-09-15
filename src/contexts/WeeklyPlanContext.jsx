import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateAIRecommendation } from '../services/aiRecommendationService';
import { getDayExercisePlan, CATEGORY_META } from '../data/weeklyExerciseDatabase';

const WeeklyPlanContext = createContext(null);

const STORAGE_KEY = 'tinnitoff_weekly_plan_v1';
const HISTORY_KEY = 'tinnitoff_plan_history_v1';

export const WeeklyPlanProvider = ({ children }) => {
  const [activePlan, setActivePlan] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error loading stored weekly plan:', e);
      return null;
    }
  });

  const [planHistory, setPlanHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (activePlan) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activePlan));
      } catch (e) {
        console.error('Error saving weekly plan:', e);
      }
    }
  }, [activePlan]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(planHistory));
    } catch (e) {
      console.error('Error saving plan history:', e);
    }
  }, [planHistory]);

  const startNewPlan = (thiResult, matchedFrequency = null) => {
    const recommendation = generateAIRecommendation(thiResult, matchedFrequency);

    if (activePlan) {
      setPlanHistory(prev => [...prev, {
        ...activePlan,
        endedAt: new Date().toISOString(),
        finalWeek: activePlan.currentWeek,
        finalDay: activePlan.currentDay,
      }]);
    }

    const newPlan = {
      createdAt: new Date().toISOString(),
      thiResult,
      matchedFrequency,
      recommendation,
      currentWeek: 1,
      currentDay: 1,
      activeTaskIndex: 0,
      completedTasks: {},
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };

    setActivePlan(newPlan);
    return newPlan;
  };

  const completeTask = (taskId) => {
    if (!activePlan) return;

    setActivePlan(prev => {
      const now = new Date().toISOString();
      const updatedCompleted = {
        ...prev.completedTasks,
        [taskId]: now
      };

      const currentDayPlan = getDayExercisePlan(prev.currentWeek, prev.currentDay);
      const allCurrentDayTasksDone = currentDayPlan.tasks.every(t => !!updatedCompleted[t.id]);

      let newDay = prev.currentDay;
      let newWeek = prev.currentWeek;
      let newActiveTaskIndex = prev.activeTaskIndex;

      if (allCurrentDayTasksDone) {
        if (prev.currentDay < 7) {
          newDay = prev.currentDay + 1;
          newActiveTaskIndex = 0;
        } else {
          newWeek = prev.currentWeek + 1;
          newDay = 1;
          newActiveTaskIndex = 0;
        }
      } else {
        newActiveTaskIndex = Math.min(prev.activeTaskIndex + 1, currentDayPlan.tasks.length - 1);
      }

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const isConsecutive = prev.lastActiveDate === today || prev.lastActiveDate === yesterday;

      return {
        ...prev,
        completedTasks: updatedCompleted,
        currentDay: newDay,
        currentWeek: newWeek,
        activeTaskIndex: newActiveTaskIndex,
        lastActiveDate: today,
        streakDays: isConsecutive ? (prev.streakDays || 0) + 1 : 1
      };
    });
  };

  const setCurrentDay = (dayNum) => {
    if (!activePlan) return;
    setActivePlan(prev => ({
      ...prev,
      currentDay: Math.max(1, Math.min(7, dayNum)),
      activeTaskIndex: 0
    }));
  };

  const setTaskIndex = (index) => {
    if (!activePlan) return;
    setActivePlan(prev => ({
      ...prev,
      activeTaskIndex: index
    }));
  };

  const resetPlan = () => {
    if (activePlan) {
      setPlanHistory(prev => [...prev, {
        ...activePlan,
        endedAt: new Date().toISOString(),
        finalWeek: activePlan.currentWeek,
        finalDay: activePlan.currentDay,
      }]);
    }
    setActivePlan(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getDayProgress = (weekNum, dayNum) => {
    if (!activePlan) return 0;
    const plan = getDayExercisePlan(weekNum, dayNum);
    if (!plan || !plan.tasks.length) return 0;

    const completedCount = plan.tasks.filter(t => !!activePlan.completedTasks[t.id]).length;
    return Math.round((completedCount / plan.tasks.length) * 100);
  };

  const getWeekProgress = (weekNum) => {
    if (!activePlan) return 0;
    let totalTasks = 0;
    let completedTasksCount = 0;

    for (let d = 1; d <= 7; d++) {
      const dayPlan = getDayExercisePlan(weekNum, d);
      totalTasks += dayPlan.tasks.length;
      completedTasksCount += dayPlan.tasks.filter(t => !!activePlan.completedTasks[t.id]).length;
    }

    if (totalTasks === 0) return 0;
    return Math.round((completedTasksCount / totalTasks) * 100);
  };

  const getOverallProgress = () => {
    if (!activePlan) return 0;
    const totalWeeks = activePlan.recommendation?.recommendedWeeksCount || 4;
    let totalTasks = 0;
    let completedCount = 0;

    for (let w = 1; w <= totalWeeks; w++) {
      for (let d = 1; d <= 7; d++) {
        const dayPlan = getDayExercisePlan(w, d);
        totalTasks += dayPlan.tasks.length;
        completedCount += dayPlan.tasks.filter(t => !!activePlan.completedTasks[t.id]).length;
      }
    }

    if (totalTasks === 0) return 0;
    return Math.round((completedCount / totalTasks) * 100);
  };

  const getPlanStats = () => {
    if (!activePlan) return null;

    const completedList = Object.entries(activePlan.completedTasks);
    const totalCompleted = completedList.length;

    let totalTimeInvested = 0;
    let categoryCount = {};

    for (let w = 1; w <= (activePlan.recommendation?.recommendedWeeksCount || 4); w++) {
      for (let d = 1; d <= 7; d++) {
        const dayPlan = getDayExercisePlan(w, d);
        dayPlan.tasks.forEach(task => {
          if (activePlan.completedTasks[task.id]) {
            totalTimeInvested += task.durationMinutes;
            const cat = task.category || 'sound';
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
          }
        });
      }
    }

    let totalTasksAllWeeks = 0;
    for (let w = 1; w <= (activePlan.recommendation?.recommendedWeeksCount || 4); w++) {
      for (let d = 1; d <= 7; d++) {
        totalTasksAllWeeks += getDayExercisePlan(w, d).tasks.length;
      }
    }

    const daysSinceStart = Math.max(1, Math.ceil(
      (Date.now() - new Date(activePlan.createdAt).getTime()) / 86400000
    ));

    return {
      totalCompleted,
      totalTasks: totalTasksAllWeeks,
      totalTimeInvested,
      daysSinceStart,
      avgDailyTasks: totalCompleted > 0 ? Math.round(totalCompleted / daysSinceStart * 10) / 10 : 0,
      categoryCount,
    };
  };

  const getWeekComparison = () => {
    if (!activePlan || activePlan.currentWeek < 2) return null;

    const prevWeek = activePlan.currentWeek - 1;

    const getWeekData = (weekNum) => {
      let total = 0;
      let completed = 0;
      let time = 0;

      for (let d = 1; d <= 7; d++) {
        const dayPlan = getDayExercisePlan(weekNum, d);
        dayPlan.tasks.forEach(task => {
          total++;
          if (activePlan.completedTasks[task.id]) {
            completed++;
            time += task.durationMinutes;
          }
        });
      }
      return { total, completed, time, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    const prevData = getWeekData(prevWeek);
    const currData = getWeekData(activePlan.currentWeek);

    let trend = 'stable';
    const diff = currData.percent - prevData.percent;
    if (diff > 5) trend = 'improving';
    else if (diff < -5) trend = 'declining';

    return {
      previous: prevData,
      current: currData,
      trend,
      diff: Math.abs(diff),
    };
  };

  const getCategoryBreakdown = (weekNum) => {
    if (!activePlan) return [];
    const week = weekNum || activePlan.currentWeek;
    const counts = {};

    for (let d = 1; d <= 7; d++) {
      const dayPlan = getDayExercisePlan(week, d);
      dayPlan.tasks.forEach(task => {
        const cat = task.category || 'sound';
        if (!counts[cat]) {
          counts[cat] = { ...CATEGORY_META[cat], count: 0, completed: 0 };
        }
        counts[cat].count++;
        if (activePlan.completedTasks[task.id]) {
          counts[cat].completed++;
        }
      });
    }

    return Object.values(counts);
  };

  const getDayHistory = () => {
    if (!activePlan) return [];
    const history = [];
    const week = activePlan.currentWeek;

    for (let d = 1; d <= 7; d++) {
      const dayPlan = getDayExercisePlan(week, d);
      const completedTasks = dayPlan.tasks.filter(t => !!activePlan.completedTasks[t.id]);
      const totalMinutes = dayPlan.tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
      const completedMinutes = completedTasks.reduce((sum, t) => sum + t.durationMinutes, 0);

      history.push({
        day: d,
        title: dayPlan.dayTitle,
        totalTasks: dayPlan.tasks.length,
        completedTasks: completedTasks.length,
        totalMinutes,
        completedMinutes,
        percent: dayPlan.tasks.length > 0
          ? Math.round((completedTasks.length / dayPlan.tasks.length) * 100)
          : 0,
        isComplete: completedTasks.length === dayPlan.tasks.length,
        isCurrent: d === activePlan.currentDay,
      });
    }

    return history;
  };

  return (
    <WeeklyPlanContext.Provider
      value={{
        activePlan,
        planHistory,
        startNewPlan,
        completeTask,
        setCurrentDay,
        setTaskIndex,
        resetPlan,
        getDayProgress,
        getWeekProgress,
        getOverallProgress,
        getPlanStats,
        getWeekComparison,
        getCategoryBreakdown,
        getDayHistory,
      }}
    >
      {children}
    </WeeklyPlanContext.Provider>
  );
};

export const useWeeklyPlan = () => {
  const context = useContext(WeeklyPlanContext);
  if (!context) {
    throw new Error('useWeeklyPlan debe usarse dentro de un WeeklyPlanProvider');
  }
  return context;
};
