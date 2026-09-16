"use client";

import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function CollegeWorkspacePage() {
  const courses = [
    {
      code: "CS-401",
      name: "Analysis of Algorithms",
      nextDue: "Chapter 4 Homework (Due Tomorrow)",
      grade: "A",
      progress: 80,
    },
    {
      code: "CS-405",
      name: "Distributed Operating Systems",
      nextDue: "Lab Assignment 3 (Due in 4 days)",
      grade: "A-",
      progress: 65,
    },
    {
      code: "MTH-302",
      name: "Applied Linear Algebra",
      nextDue: "Problem Set 6 (Next Week)",
      grade: "B+",
      progress: 50,
    },
    {
      code: "SE-410",
      name: "Software Architecture & Design",
      nextDue: "Term Project Milestone (In 2 weeks)",
      grade: "A",
      progress: 90,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        badge="Semester 7 • Computer Science"
        badgeColor="text-emerald-400 bg-emerald-500/15"
        metaText="CGPA: 3.82 • 4 Active Modules"
        title="College Workspace"
        description="Academic curriculum tracking, lecture note repositories, and assignment submissions."
        actions={
          <>
            <Button variant="secondary" icon="menu_book">
              Course Syllabus
            </Button>
            <Button variant="primary" icon="post_add">
              + New Assignment
            </Button>
          </>
        }
      />

      {/* 4 Academic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Current Modules
            </span>
            <Icon name="school" size={18} className="text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-headline text-on-surface">4 Enrolled</span>
          <span className="text-xs text-on-surface-variant block mt-1">16 Credit Hours</span>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Pending Deliverables
            </span>
            <Icon name="assignment_turned_in" size={18} className="text-primary" />
          </div>
          <span className="text-2xl font-bold font-headline text-on-surface">3 Tasks</span>
          <span className="text-xs text-secondary font-mono block mt-1">1 due in 24h</span>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Midterm Schedule
            </span>
            <Icon name="event_note" size={18} className="text-tertiary" />
          </div>
          <span className="text-2xl font-bold font-headline text-on-surface">In 3 Weeks</span>
          <span className="text-xs text-on-surface-variant block mt-1">First paper: CS-401</span>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Attendance
            </span>
            <Icon name="fact_check" size={18} className="text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-headline text-emerald-400">96.4%</span>
          <span className="text-xs text-on-surface-variant block mt-1">100% prerequisite met</span>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="space-y-3">
        <h3 className="font-headline text-base font-bold text-on-surface">
          Active Course Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Card
              key={course.code}
              variant="low"
              className="p-5 border-l-4 border-l-emerald-500 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono text-xs font-semibold">
                  {course.code}
                </span>
                <span className="font-mono text-xs text-outline">Grade: {course.grade}</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-on-surface">{course.name}</h4>
                <p className="text-xs text-on-surface-variant mt-1">{course.nextDue}</p>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-outline font-mono">
                  <span>Syllabus Covered</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
