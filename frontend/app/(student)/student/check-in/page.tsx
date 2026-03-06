'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ============================================================
// Shared logic & types
// ============================================================

const useCurrentTime = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return time;
};

const useLocationStatus = () => {
    const [status, setStatus] = useState<'loading' | 'in-range' | 'out-range' | 'error'>('loading');
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setStatus('error');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setStatus('in-range');
            },
            () => setStatus('error')
        );
    }, []);

    return { status, coords };
};

const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < breakpoint);
        check();
        setIsReady(true);
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, [breakpoint]);

    return { isMobile, isReady };
};

const formatTime = (date: Date) =>
    date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

const formatDate = (date: Date) =>
    date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

const formatDateFull = (date: Date) =>
    date.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ============================================================
// Main Page Component
// ============================================================

const CheckInPage = () => {
    const currentTime = useCurrentTime();
    const { status: locationStatus } = useLocationStatus();
    const { isMobile, isReady } = useIsMobile();

    const [checkInTime, setCheckInTime] = useState<string | null>(null);
    const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [note, setNote] = useState('');

    const handleCheckIn = useCallback(async () => {
        setIsCheckingIn(true);
        await new Promise((r) => setTimeout(r, 1000));
        setCheckInTime(formatTime(new Date()));
        setIsCheckingIn(false);
    }, []);

    const handleCheckOut = useCallback(async () => {
        setIsCheckingOut(true);
        await new Promise((r) => setTimeout(r, 1000));
        setCheckOutTime(formatTime(new Date()));
        setIsCheckingOut(false);
    }, []);

    const getStatus = () => {
        if (checkInTime && checkOutTime) return 'completed';
        if (checkInTime) return 'checked-in';
        return 'pending';
    };
    const status = getStatus();

    // Don't render until we know if it's mobile or not (avoids hydration flash)
    if (!isReady) return null;

    // ============================================================
    // MOBILE / PWA VIEW
    // ============================================================
    if (isMobile) {
        const totalHours = 560;
        const completedHours = 420;
        const progress = (completedHours / totalHours) * 100;
        const radius = 50;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference * (1 - progress / 100);

        return (
            <MobileView
                currentTime={currentTime}
                checkInTime={checkInTime}
                checkOutTime={checkOutTime}
                isCheckingIn={isCheckingIn}
                isCheckingOut={isCheckingOut}
                locationStatus={locationStatus}
                handleCheckIn={handleCheckIn}
                handleCheckOut={handleCheckOut}
                totalHours={totalHours}
                completedHours={completedHours}
                radius={radius}
                circumference={circumference}
                strokeDashoffset={strokeDashoffset}
            />
        );
    }

    // ============================================================
    // DESKTOP / WEB VIEW
    // ============================================================
    return (
        <DesktopView
            currentTime={currentTime}
            checkInTime={checkInTime}
            checkOutTime={checkOutTime}
            isCheckingIn={isCheckingIn}
            isCheckingOut={isCheckingOut}
            locationStatus={locationStatus}
            handleCheckIn={handleCheckIn}
            handleCheckOut={handleCheckOut}
            status={status}
            note={note}
            setNote={setNote}
        />
    );
};

export default CheckInPage;

// ============================================================
// MOBILE VIEW COMPONENT
// ============================================================

interface MobileViewProps {
    currentTime: Date;
    checkInTime: string | null;
    checkOutTime: string | null;
    isCheckingIn: boolean;
    isCheckingOut: boolean;
    locationStatus: 'loading' | 'in-range' | 'out-range' | 'error';
    handleCheckIn: () => void;
    handleCheckOut: () => void;
    totalHours: number;
    completedHours: number;
    radius: number;
    circumference: number;
    strokeDashoffset: number;
}

const MobileView: React.FC<MobileViewProps> = ({
    currentTime,
    checkInTime,
    checkOutTime,
    isCheckingIn,
    isCheckingOut,
    locationStatus,
    handleCheckIn,
    handleCheckOut,
    totalHours,
    completedHours,
}) => {
    // Determine dimensions locally for the inner ring instead of relying on props
    const r = 46;
    const c = 2 * Math.PI * r;
    const progress = (completedHours / totalHours) * 100;
    const offset = c * (1 - progress / 100);

    const formatMobileDate = (date: Date) => date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    const formatMobileTime = (date: Date) => date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-60px)] font-nunito -m-4 sm:-m-6 px-4 pt-10 pb-12 overflow-hidden relative">

            {/* Background Base */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#fdfbfe]">
                {/* Top Left: #FDB022 (Yellow/Orange) */}
                <div className="absolute top-[-5%] left-[-15%] w-[60vw] min-w-[280px] h-[60vw] min-h-[280px] rounded-full bg-[#FDB022] opacity-[0.55] blur-[150px] animate-float1"></div>

                {/* Top Right: #C212F7 (Purple) */}
                <div className="absolute top-[-10%] right-[-15%] w-[60vw] min-w-[280px] h-[120vw] min-h-[280px] rounded-full bg-[#C212F7] opacity-[0.5] blur-[90px] animate-float2"></div>

                {/* Bottom Left: #A80689 (Magenta) */}
                <div className="absolute bottom-[-5%] left-[-15%] w-[65vw] min-w-[300px] h-[80vw] min-h-[300px] rounded-full bg-[#A80689] opacity-[0.45] blur-[70px] animate-float3"></div>

                {/* Bottom Right: #58F9FF (Cyan) */}
                <div className="absolute bottom-[-5%] right-[-15%] w-[65vw] min-w-[300px] h-[65vw] min-h-[300px] rounded-full bg-[#58F9FF] opacity-[0.55] blur-[200px] animate-float4"></div>
            </div>

            {/* Label top */}
            <p className="text-[13px] font-semibold text-gray-800 mb-[75px] z-10">ความคืบหน้าในการฝึกงาน</p>

            {/* White Card */}
            <div className="relative w-full max-w-[340px] bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] pt-[75px] pb-8 px-6 flex flex-col items-center">

                {/* Floating Progress Ring */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[45%] bg-white/60 backdrop-blur-sm rounded-full p-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                    <div className="relative w-[110px] h-[110px] bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="55" cy="55" r={r} fill="none" stroke="#f4f4f4" strokeWidth="6" />
                            <circle
                                cx="55" cy="55" r={r} fill="none"
                                stroke="url(#pinkGrad)" strokeWidth="6" strokeLinecap="round"
                                strokeDasharray={c} strokeDashoffset={offset}
                                className="transition-all duration-1000 ease-in-out"
                            />
                            <defs>
                                <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#d81b60" />
                                    <stop offset="100%" stopColor="#9C27B0" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="text-[13px] font-black text-black z-10 leading-none">{completedHours} / {totalHours}</span>
                        <span className="text-[10px] font-semibold text-gray-700 z-10 mt-1">ชั่วโมง</span>
                    </div>
                </div>

                {/* Clock */}
                <div className="text-[54px] font-bold text-black tracking-tight leading-none mb-3 mt-4">
                    {formatMobileTime(currentTime)}
                </div>
                <div className="text-[20px] font-medium text-black mb-12">
                    {formatMobileDate(currentTime)}
                </div>

                {/* Location */}
                <div className="flex flex-col items-center gap-3 mb-10 mt-4">
                    <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white border-4 border-white shadow-sm ring-1 ring-gray-100">
                        {locationStatus === 'loading' && <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>}
                        {locationStatus === 'in-range' && <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}
                        {locationStatus === 'out-range' && <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}
                        {locationStatus === 'error' && <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>}
                    </div>

                    <span className="text-[13px] font-medium text-gray-800">
                        {locationStatus === 'loading' ? 'กำลังค้นหาตำแหน่ง...' : locationStatus === 'in-range' ? 'อยู่ในตำแหน่งที่กำหนด' : locationStatus === 'out-range' ? 'ไม่อยู่ในตำแหน่งที่กำหนด' : 'ไม่สามารถระบุตำแหน่งได้'}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center gap-4 w-full px-2">
                    <button
                        className={`w-full py-3.5 rounded-lg text-[15px] font-semibold transition-all duration-200 disabled:opacity-60 
                            ${checkInTime ? 'bg-green-100 text-green-700' : 'bg-[#EAEAEA] text-[#222] hover:bg-[#dfdfdf] active:scale-[0.98]'}`}
                        disabled={!!checkInTime || isCheckingIn}
                        onClick={handleCheckIn}
                    >
                        {isCheckingIn ? (
                            <span className="flex justify-center items-center gap-2">
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                กำลังบันทึก...
                            </span>
                        ) : checkInTime ? `ลงเวลาเข้าแล้ว ${checkInTime} ✓` : 'ลงเวลาเข้างาน'}
                    </button>

                    <button
                        className={`w-full py-3.5 rounded-lg text-[15px] font-semibold transition-all duration-200 disabled:opacity-60 
                            ${checkOutTime ? 'bg-orange-100 text-orange-700' : 'bg-[#EAEAEA] text-[#222] hover:bg-[#dfdfdf] active:scale-[0.98]'}`}
                        disabled={!checkInTime || !!checkOutTime || isCheckingOut}
                        onClick={handleCheckOut}
                    >
                        {isCheckingOut ? (
                            <span className="flex justify-center items-center gap-2">
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                กำลังบันทึก...
                            </span>
                        ) : checkOutTime ? `ลงเวลาออกแล้ว ${checkOutTime} ✓` : 'ลงเวลาออกงาน'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// DESKTOP VIEW COMPONENT
// ============================================================

interface DesktopViewProps {
    currentTime: Date;
    checkInTime: string | null;
    checkOutTime: string | null;
    isCheckingIn: boolean;
    isCheckingOut: boolean;
    locationStatus: 'loading' | 'in-range' | 'out-range' | 'error';
    handleCheckIn: () => void;
    handleCheckOut: () => void;
    status: string;
    note: string;
    setNote: (v: string) => void;
}

const DesktopView: React.FC<DesktopViewProps> = ({
    currentTime,
    checkInTime,
    checkOutTime,
    isCheckingIn,
    isCheckingOut,
    locationStatus,
    handleCheckIn,
    handleCheckOut,
    status,
    note,
    setNote,
}) => {
    return (
        <div className="p-4 sm:p-6">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-dark dark:text-white">ลงเวลาเข้า-ออก</h1>
                <p className="mt-1 text-sm text-white-dark">บันทึกเวลาเข้าทำงานและเวลาออกงานประจำวัน</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column */}
                <div className="lg:col-span-2">
                    {/* Clock */}
                    <div className="panel mb-6 text-center">
                        <div className="mb-2 text-sm font-medium text-white-dark">{formatDateFull(currentTime)}</div>
                        <div className="text-5xl font-bold tracking-wider text-[#9C27B0] sm:text-6xl">{formatTime(currentTime)}</div>
                        <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                            {locationStatus === 'in-range' && (
                                <>
                                    <svg className="h-4 w-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                    <span className="text-success">ตำแหน่งพร้อมใช้งาน</span>
                                </>
                            )}
                            {locationStatus === 'error' && (
                                <>
                                    <svg className="h-4 w-4 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                    <span className="text-danger">ไม่สามารถเข้าถึงตำแหน่งได้</span>
                                </>
                            )}
                            {locationStatus === 'loading' && (
                                <>
                                    <svg className="h-4 w-4 animate-spin text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                    <span className="text-info">กำลังระบุตำแหน่ง...</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Check In / Out Buttons */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Check In */}
                        <div className="panel flex flex-col items-center py-8">
                            <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${checkInTime ? 'bg-success/20' : 'bg-[#9C27B0]/10'}`}>
                                {checkInTime ? (
                                    <svg className="h-10 w-10 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                ) : (
                                    <svg className="h-10 w-10 text-[#9C27B0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                                )}
                            </div>
                            <h3 className="mb-1 text-lg font-semibold text-dark dark:text-white">ลงเวลาเข้า</h3>
                            {checkInTime ? (
                                <p className="mb-4 text-2xl font-bold text-success">{checkInTime}</p>
                            ) : (
                                <p className="mb-4 text-sm text-white-dark">ยังไม่ได้ลงเวลาเข้า</p>
                            )}
                            <button type="button" className="btn btn-primary w-full max-w-[200px] disabled:opacity-50" style={{ backgroundColor: '#9C27B0', borderColor: '#9C27B0' }} disabled={!!checkInTime || isCheckingIn} onClick={handleCheckIn}>
                                {isCheckingIn ? (<span className="flex items-center justify-center gap-2"><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>กำลังบันทึก...</span>) : checkInTime ? 'ลงเวลาเข้าแล้ว ✓' : 'ลงเวลาเข้า'}
                            </button>
                        </div>

                        {/* Check Out */}
                        <div className="panel flex flex-col items-center py-8">
                            <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${checkOutTime ? 'bg-warning/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                {checkOutTime ? (
                                    <svg className="h-10 w-10 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                ) : (
                                    <svg className="h-10 w-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                )}
                            </div>
                            <h3 className="mb-1 text-lg font-semibold text-dark dark:text-white">ลงเวลาออก</h3>
                            {checkOutTime ? (
                                <p className="mb-4 text-2xl font-bold text-warning">{checkOutTime}</p>
                            ) : (
                                <p className="mb-4 text-sm text-white-dark">ยังไม่ได้ลงเวลาออก</p>
                            )}
                            <button type="button" className="btn btn-warning w-full max-w-[200px] disabled:opacity-50" disabled={!checkInTime || !!checkOutTime || isCheckingOut} onClick={handleCheckOut}>
                                {isCheckingOut ? (<span className="flex items-center justify-center gap-2"><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>กำลังบันทึก...</span>) : checkOutTime ? 'ลงเวลาออกแล้ว ✓' : 'ลงเวลาออก'}
                            </button>
                        </div>
                    </div>

                    {/* Note */}
                    <div className="panel mt-6">
                        <h3 className="mb-3 text-base font-semibold text-dark dark:text-white">หมายเหตุ (ถ้ามี)</h3>
                        <textarea className="form-textarea" rows={3} placeholder="เช่น มาสาย เนื่องจากรถติด..." value={note} onChange={(e) => setNote(e.target.value)} />
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    <div className="panel mb-6">
                        <h3 className="mb-4 text-base font-semibold text-dark dark:text-white">สถานะวันนี้</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white-dark">สถานะ</span>
                                {status === 'completed' && <span className="badge bg-success">เสร็จสมบูรณ์</span>}
                                {status === 'checked-in' && <span className="badge bg-info">กำลังปฏิบัติงาน</span>}
                                {status === 'pending' && <span className="badge bg-dark/30 text-dark dark:text-white-dark">รอลงเวลา</span>}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white-dark">เวลาเข้า</span>
                                <span className={`text-sm font-semibold ${checkInTime ? 'text-success' : 'text-white-dark'}`}>{checkInTime || '--:--:--'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white-dark">เวลาออก</span>
                                <span className={`text-sm font-semibold ${checkOutTime ? 'text-warning' : 'text-white-dark'}`}>{checkOutTime || '--:--:--'}</span>
                            </div>
                            <div className="border-t border-white-light pt-3 dark:border-white/10">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white-dark">เวลาทำงานมาตรฐาน</span>
                                    <span className="text-sm font-semibold text-dark dark:text-white">08:00 - 17:00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="panel">
                        <h3 className="mb-4 text-base font-semibold text-dark dark:text-white">ข้อมูลประจำเดือน</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-md bg-success/10 px-3 py-2">
                                <span className="text-sm text-success">วันทำงาน</span>
                                <span className="text-lg font-bold text-success">18</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md bg-danger/10 px-3 py-2">
                                <span className="text-sm text-danger">วันลา</span>
                                <span className="text-lg font-bold text-danger">2</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md bg-warning/10 px-3 py-2">
                                <span className="text-sm text-warning">มาสาย</span>
                                <span className="text-lg font-bold text-warning">1</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md bg-info/10 px-3 py-2">
                                <span className="text-sm text-info">วันทำงานคงเหลือ</span>
                                <span className="text-lg font-bold text-info">1</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
