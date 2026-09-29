"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function CalendarResponsiveDefault({date}:{date:string}){const router=useRouter();useEffect(()=>{const view=window.matchMedia("(max-width: 767px)").matches?"day":"week";router.replace(`/calendar?view=${view}&date=${date}`)},[date,router]);return null}
