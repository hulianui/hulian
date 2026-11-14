"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dayjs, type SeatStatus, type Zone } from "@hulianui/ui";
import { useMockData } from "../../lib/async";
import { DEMO_DAY, DEMO_NOW, DEFAULT_SETTINGS, buildSeed } from "../_data/org";
import type {
  ActivityRecord,
  DepartmentRecord,
  InterviewRecord,
  InterviewStatus,
  OrgData,
  OrgSettings,
  PersonRecord,
  SeatRecord,
} from "../_data/types";

interface OrgStats {
  totalPeople: number;
  totalSeats: number;
  occupiedSeats: number;
  emptySeats: number;
  unassignedPeople: number;
  occupancy: number;
  statusCounts: Record<SeatStatus, number>;
  todayInterviews: number;
  ongoingInterviews: number;
}

interface OrgStore {
  state: OrgData;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  zones: Zone[];
  stats: OrgStats;
  peopleById: Map<string, PersonRecord>;
  departmentsById: Map<string, DepartmentRecord>;
  seatsById: Map<string, SeatRecord>;
  unassignedPeople: PersonRecord[];
  setStatus: (seatId: string, status: SeatStatus) => void;
  assignSeat: (seatId: string, personId: string) => void;
  moveSeat: (personId: string, seatId: string) => void;
  releaseSeat: (seatId: string) => void;
  addInterview: (input: Omit<InterviewRecord, "id" | "status">) => void;
  updateInterview: (id: string, patch: Partial<Pick<InterviewRecord, "start" | "end" | "roomId">>) => void;
  setInterviewStatus: (id: string, status: InterviewStatus) => void;
  updateDepartment: (id: string, patch: Partial<Pick<DepartmentRecord, "name" | "accent" | "facing" | "floor" | "leadId">>) => void;
  addDepartment: (input: { name: string; accent: string; facing: DepartmentRecord["facing"]; floor: string; leadId: string }) => void;
  removeDepartment: (id: string) => void;
  updateSettings: (patch: Partial<OrgSettings>) => void;
  reset: () => void;
}

const Ctx = createContext<OrgStore | null>(null);

// 演示内时钟：动作产生的动态都接在固定演示时刻之后，避免真实系统时钟与 DEMO_NOW 打架。
let tick = 0;
function stamp(): string {
  tick += 1;
  return dayjs(DEMO_NOW).add(tick, "minute").format("YYYY-MM-DDTHH:mm:ss");
}

function pushActivity(state: OrgData, activity: ActivityRecord): ActivityRecord[] {
  return [activity, ...state.activity].slice(0, 40);
}

function findPerson(state: OrgData, personId: string | undefined): PersonRecord | undefined {
  if (!personId) return undefined;
  return state.people.find((person) => person.id === personId);
}

export function OrgStoreProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(buildSeed, []);
  const { data, loading, error, reload } = useMockData(seed, { delay: 520 });
  const [state, setState] = useState<OrgData>(seed);

  useEffect(() => {
    if (data) setState(data);
  }, [data]);

  const peopleById = useMemo(
    () => new Map(state.people.map((person) => [person.id, person])),
    [state.people],
  );
  const departmentsById = useMemo(
    () => new Map(state.departments.map((department) => [department.id, department])),
    [state.departments],
  );
  const seatsById = useMemo(() => new Map(state.seats.map((seat) => [seat.id, seat])), [state.seats]);

  const zones = useMemo<Zone[]>(
    () =>
      state.departments.map((department) => ({
        id: department.id,
        name: department.name,
        accent: department.accent,
        facing: department.facing,
        seats: state.seats
          .filter((seat) => seat.departmentId === department.id)
          .sort((a, b) => a.row - b.row || a.col - b.col)
          .map((seat) => {
            const person = seat.personId ? peopleById.get(seat.personId) : undefined;
            const base = { id: seat.id, row: seat.row, col: seat.col };
            return person
              ? {
                  ...base,
                  person: { id: person.id, name: person.name, status: person.status },
                }
              : base;
          }),
      })),
    [state.departments, state.seats, peopleById],
  );

  const stats = useMemo<OrgStats>(() => {
    const statusCounts: Record<SeatStatus, number> = {
      idle: 0,
      busy: 0,
      meeting: 0,
      leave: 0,
      interview: 0,
    };
    let occupiedSeats = 0;
    for (const seat of state.seats) {
      if (!seat.personId) continue;
      const person = peopleById.get(seat.personId);
      if (!person) continue;
      occupiedSeats += 1;
      statusCounts[person.status] += 1;
    }
    const todayInterviews = state.interviews.filter(
      (interview) => interview.start.startsWith(DEMO_DAY) && interview.status !== "canceled",
    );
    return {
      totalPeople: state.people.length,
      totalSeats: state.seats.length,
      occupiedSeats,
      emptySeats: state.seats.length - occupiedSeats,
      unassignedPeople: state.people.filter((person) => !person.seatId).length,
      occupancy: state.seats.length === 0 ? 0 : Math.round((occupiedSeats / state.seats.length) * 100),
      statusCounts,
      todayInterviews: todayInterviews.length,
      ongoingInterviews: todayInterviews.filter((interview) => interview.status === "ongoing").length,
    };
  }, [state.seats, state.people, state.interviews, peopleById]);

  const unassignedPeople = useMemo(
    () => state.people.filter((person) => !person.seatId),
    [state.people],
  );

  const setStatus = useCallback((seatId: string, status: SeatStatus) => {
    const at = stamp();
    setState((prev) => {
      const seat = prev.seats.find((item) => item.id === seatId);
      const person = findPerson(prev, seat?.personId);
      if (!person || person.status === status) return prev;
      const people = prev.people.map((item) =>
        item.id === person.id ? { ...item, status } : item,
      );
      return {
        ...prev,
        people,
        activity: pushActivity(prev, {
          id: `act-${at}`,
          at,
          kind: "status",
          personId: person.id,
          seatId,
          status,
        }),
      };
    });
  }, []);

  const assignSeat = useCallback((seatId: string, personId: string) => {
    const at = stamp();
    setState((prev) => {
      const seat = prev.seats.find((item) => item.id === seatId);
      const person = findPerson(prev, personId);
      if (!seat || !person || seat.personId) return prev;
      const previousSeatId = person.seatId;
      const seats = prev.seats.map((item) => {
        if (item.id === seatId) return { ...item, personId };
        if (previousSeatId && item.id === previousSeatId) return { ...item, personId: undefined };
        return item;
      });
      const people = prev.people.map((item) =>
        item.id === personId ? { ...item, seatId } : item,
      );
      return {
        ...prev,
        seats,
        people,
        activity: pushActivity(prev, {
          id: `act-${at}`,
          at,
          kind: "seat",
          personId,
          seatId,
          note: "assigned",
        }),
      };
    });
  }, []);

  const moveSeat = useCallback((personId: string, seatId: string) => {
    const at = stamp();
    setState((prev) => {
      const seat = prev.seats.find((item) => item.id === seatId);
      const person = findPerson(prev, personId);
      if (!seat || !person || seat.personId) return prev;
      const previousSeatId = person.seatId;
      const seats = prev.seats.map((item) => {
        if (item.id === seatId) return { ...item, personId };
        if (previousSeatId && item.id === previousSeatId) return { ...item, personId: undefined };
        return item;
      });
      const people = prev.people.map((item) =>
        item.id === personId ? { ...item, seatId } : item,
      );
      return {
        ...prev,
        seats,
        people,
        activity: pushActivity(prev, {
          id: `act-${at}`,
          at,
          kind: "seat",
          personId,
          seatId,
          note: "assigned",
        }),
      };
    });
  }, []);

  const releaseSeat = useCallback((seatId: string) => {
    const at = stamp();
    setState((prev) => {
      const seat = prev.seats.find((item) => item.id === seatId);
      const person = findPerson(prev, seat?.personId);
      if (!seat || !person) return prev;
      const seats = prev.seats.map((item) =>
        item.id === seatId ? { ...item, personId: undefined } : item,
      );
      const people = prev.people.map((item) =>
        item.id === person.id ? { ...item, seatId: undefined } : item,
      );
      return {
        ...prev,
        seats,
        people,
        activity: pushActivity(prev, {
          id: `act-${at}`,
          at,
          kind: "seat",
          personId: person.id,
          seatId,
          note: "released",
        }),
      };
    });
  }, []);

  const addInterview = useCallback((input: Omit<InterviewRecord, "id" | "status">) => {
    const at = stamp();
    setState((prev) => ({
      ...prev,
      interviews: [
        ...prev.interviews,
        { ...input, id: `iv-${Date.now()}`, status: "scheduled" },
      ],
      activity: pushActivity(prev, {
        id: `act-${at}`,
        at,
        kind: "interview",
        candidate: input.candidate,
        note: "scheduled",
      }),
    }));
  }, []);

  const updateInterview = useCallback(
    (id: string, patch: Partial<Pick<InterviewRecord, "start" | "end" | "roomId">>) => {
      setState((prev) => ({
        ...prev,
        interviews: prev.interviews.map((interview) =>
          interview.id === id ? { ...interview, ...patch } : interview,
        ),
      }));
    },
    [],
  );

  const setInterviewStatus = useCallback((id: string, status: InterviewStatus) => {
    const at = stamp();
    setState((prev) => {
      const interview = prev.interviews.find((item) => item.id === id);
      if (!interview || interview.status === status) return prev;
      return {
        ...prev,
        interviews: prev.interviews.map((item) =>
          item.id === id ? { ...item, status } : item,
        ),
        activity: pushActivity(prev, {
          id: `act-${at}`,
          at,
          kind: "interview",
          candidate: interview.candidate,
          note: status === "done" ? "done" : status === "canceled" ? "canceled" : "scheduled",
        }),
      };
    });
  }, []);

  const updateDepartment = useCallback(
    (
      id: string,
      patch: Partial<Pick<DepartmentRecord, "name" | "accent" | "facing" | "floor" | "leadId">>,
    ) => {
      setState((prev) => ({
        ...prev,
        departments: prev.departments.map((department) =>
          department.id === id ? { ...department, ...patch } : department,
        ),
      }));
    },
    [],
  );

  const addDepartment = useCallback(
    (input: {
      name: string;
      accent: string;
      facing: DepartmentRecord["facing"];
      floor: string;
      leadId: string;
    }) => {
      setState((prev) => {
        const id = `dept-${Date.now()}`;
        const seats: SeatRecord[] = Array.from({ length: 6 }, (_, index) => ({
          id: `${id}-${String(index + 1).padStart(2, "0")}`,
          departmentId: id,
          row: Math.floor(index / 3) + 1,
          col: (index % 3) + 1,
        }));
        return {
          ...prev,
          departments: [...prev.departments, { id, ...input }],
          seats: [...prev.seats, ...seats],
        };
      });
    },
    [],
  );

  const removeDepartment = useCallback((id: string) => {
    setState((prev) => {
      const memberSeats = prev.seats.filter((seat) => seat.departmentId === id);
      if (memberSeats.some((seat) => seat.personId)) return prev;
      return {
        ...prev,
        departments: prev.departments.filter((department) => department.id !== id),
        seats: prev.seats.filter((seat) => seat.departmentId !== id),
      };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<OrgSettings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const reset = useCallback(() => {
    tick = 0;
    setState(buildSeed());
  }, []);

  const value = useMemo<OrgStore>(
    () => ({
      state,
      loading,
      error,
      reload,
      zones,
      stats,
      peopleById,
      departmentsById,
      seatsById,
      unassignedPeople,
      setStatus,
      assignSeat,
      moveSeat,
      releaseSeat,
      addInterview,
      updateInterview,
      setInterviewStatus,
      updateDepartment,
      addDepartment,
      removeDepartment,
      updateSettings,
      reset,
    }),
    [
      state,
      loading,
      error,
      reload,
      zones,
      stats,
      peopleById,
      departmentsById,
      seatsById,
      unassignedPeople,
      setStatus,
      assignSeat,
      moveSeat,
      releaseSeat,
      addInterview,
      updateInterview,
      setInterviewStatus,
      updateDepartment,
      addDepartment,
      removeDepartment,
      updateSettings,
      reset,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOrg(): OrgStore {
  const store = useContext(Ctx);
  if (!store) throw new Error("useOrg must be used inside OrgStoreProvider");
  return store;
}

export { DEFAULT_SETTINGS };
