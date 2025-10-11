// import { db } from "./config";
// import {
//   collection,
//   addDoc,
//   serverTimestamp,
//   query,
//   orderBy,
//   limit,
//   onSnapshot,
//   Timestamp,
//   DocumentData,
// } from "firebase/firestore";

// export type TaskComment = {
//   id?: string;
//   authorId: string;
//   text: string;
//   createdAt?: Timestamp;
//   expiresAt?: Timestamp | null;
// };

// export function subscribeTaskComments(
//   taskId: string,
//   onComments: (comments: TaskComment[]) => void,
//   onError?: (err: unknown) => void
// ) {
//   const col = collection(db, "tasks", taskId, "comments");
//   const q = query(col, orderBy("createdAt", "desc"), limit(100));
//   const unsub = onSnapshot(
//     q,
//     (snap) => {
//       const comments = snap.docs.map((d) => {
//         const data = d.data() as DocumentData;
//         return {
//           id: d.id,
//           authorId: data.authorId as string,
//           text: data.text as string,
//           createdAt: data.createdAt as Timestamp | undefined,
//           expiresAt: (data.expiresAt as Timestamp) ?? null,
//         } as TaskComment;
//       });
//       onComments(comments);
//     },
//     (err) => onError?.(err)
//   );
//   return unsub;
// }

// export async function createTaskComment(
//   taskId: string,
//   authorId: string,
//   text: string,
//   expiresAtDate?: Date | null
// ) {
//   const col = collection(db, "tasks", taskId, "comments");
//   type Payload = {
//     authorId: string;
//     text: string;
//     createdAt: ReturnType<typeof serverTimestamp>;
//     expiresAt?: Timestamp | null;
//   };
//   const payload: Payload = {
//     authorId,
//     text,
//     createdAt: serverTimestamp(),
//     expiresAt: expiresAtDate ? Timestamp.fromDate(expiresAtDate) : null,
//   };
//   const ref = await addDoc(col, payload);
//   return ref.id;
// }
