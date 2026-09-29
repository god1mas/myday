import { z } from "zod";

const status=z.enum(["TODO","IN_PROGRESS","DONE"]),priority=z.enum(["LOW","MEDIUM","HIGH","URGENT"]),deadline=z.enum(["TODAY","UPCOMING","OVERDUE","NONE"]),sort=z.enum(["DEFAULT","DEADLINE","PRIORITY","CREATED","SMART"]);
type Params=Record<string,string|string[]|undefined>;
const one=(value:string|string[]|undefined)=>Array.isArray(value)?value[0]??"":value??"";
const many=<T extends z.ZodType>(schema:T,value:string|string[]|undefined)=>{const raw=(Array.isArray(value)?value:[value]).filter(Boolean).flatMap(item=>item!.split(",")),valid=raw.flatMap(item=>{const parsed=schema.safeParse(item);return parsed.success?[parsed.data]:[]});return [...new Set(valid)] as z.infer<T>[]};
const uuid=(value:string|string[]|undefined)=>{const parsed=z.string().uuid().safeParse(one(value));return parsed.success?parsed.data:null};
export type TaskDiscovery={q:string;statuses:z.infer<typeof status>[];priorities:z.infer<typeof priority>[];projectId:string|null;areaId:string|null;deadline:z.infer<typeof deadline>|null;sort:z.infer<typeof sort>};
export function parseTaskDiscovery(params:Params):TaskDiscovery{const d=deadline.safeParse(one(params.deadline)),s=sort.safeParse(one(params.sort).toUpperCase());return{q:one(params.q).trim().replace(/\s+/g," "),statuses:many(status,params.status),priorities:many(priority,params.priority),projectId:uuid(params.project),areaId:uuid(params.area),deadline:d.success?d.data:null,sort:s.success?s.data:"DEFAULT"}}
export function activeFilterCount(value:TaskDiscovery){return Number(Boolean(value.q))+Number(Boolean(value.statuses.length))+Number(Boolean(value.priorities.length))+Number(Boolean(value.projectId))+Number(Boolean(value.areaId))+Number(Boolean(value.deadline))+Number(value.sort!=="DEFAULT")}
