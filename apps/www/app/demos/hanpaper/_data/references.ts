import type { Reference } from "./types";

// Bibliography of the HanPaper workspace. Entries are real publications; the order here is the
// order of first citation in the Git paper, which is also the numbering of its Bibliography.
// The last entry is in the library but not cited yet (the library page flags it).

export const references: Reference[] = [
  {
    id: "rochkind1975",
    authors: "Marc J. Rochkind",
    title: "The Source Code Control System",
    venue: "IEEE Transactions on Software Engineering, SE-1(4):364-370",
    year: 1975,
    kind: "article",
    doi: "10.1109/TSE.1975.6312866",
    topics: ["history"],
    citedBy: ["git"],
    addedDaysAgo: 41,
  },
  {
    id: "tichy1985",
    authors: "Walter F. Tichy",
    title: "RCS: A System for Version Control",
    venue: "Software: Practice and Experience, 15(7):637-654",
    year: 1985,
    kind: "article",
    doi: "10.1002/spe.4380150703",
    topics: ["history", "storage"],
    citedBy: ["git"],
    addedDaysAgo: 41,
  },
  {
    id: "torvalds2005",
    authors: "Linus Torvalds",
    title: "Initial revision of \"git\", the information manager from hell",
    venue: "Git commit e83c5163316f89bfbde7d9ab23ca2e25604af290",
    year: 2005,
    kind: "commit",
    url: "https://github.com/git/git/commit/e83c5163316f89bfbde7d9ab23ca2e25604af290",
    topics: ["history"],
    citedBy: ["git"],
    addedDaysAgo: 39,
  },
  {
    id: "osullivan2009",
    authors: "Bryan O'Sullivan",
    title: "Making Sense of Revision-Control Systems",
    venue: "Communications of the ACM, 52(9):56-62",
    year: 2009,
    kind: "article",
    doi: "10.1145/1562164.1562183",
    topics: ["history", "workflow"],
    citedBy: ["git", "merge-survey"],
    addedDaysAgo: 38,
  },
  {
    id: "merkle1988",
    authors: "Ralph C. Merkle",
    title: "A Digital Signature Based on a Conventional Encryption Function",
    venue: "Advances in Cryptology: CRYPTO '87, LNCS 293, pp. 369-378, Springer",
    year: 1988,
    kind: "inproceedings",
    doi: "10.1007/3-540-48184-2_32",
    topics: ["hashing"],
    citedBy: ["git"],
    addedDaysAgo: 30,
  },
  {
    id: "stevens2017",
    authors: "Marc Stevens, Elie Bursztein, Pierre Karpman, Ange Albertini, Yarik Markov",
    title: "The First Collision for Full SHA-1",
    venue: "Advances in Cryptology: CRYPTO 2017, LNCS 10401, pp. 570-596, Springer",
    year: 2017,
    kind: "inproceedings",
    doi: "10.1007/978-3-319-63688-7_19",
    topics: ["hashing"],
    citedBy: ["git"],
    addedDaysAgo: 29,
  },
  {
    id: "git-hash-transition",
    authors: "The Git Project",
    title: "Git hash function transition",
    venue: "Git technical documentation",
    year: 2017,
    kind: "online",
    url: "https://git-scm.com/docs/hash-function-transition",
    topics: ["hashing"],
    citedBy: ["git"],
    addedDaysAgo: 29,
  },
  {
    id: "hunt1976",
    authors: "James W. Hunt, M. Douglas McIlroy",
    title: "An Algorithm for Differential File Comparison",
    venue: "Computing Science Technical Report 41, Bell Laboratories",
    year: 1976,
    kind: "techreport",
    topics: ["diff", "history"],
    citedBy: ["git", "merge-survey"],
    addedDaysAgo: 22,
  },
  {
    id: "myers1986",
    authors: "Eugene W. Myers",
    title: "An O(ND) Difference Algorithm and Its Variations",
    venue: "Algorithmica, 1(1-4):251-266",
    year: 1986,
    kind: "article",
    doi: "10.1007/BF01840446",
    topics: ["diff"],
    citedBy: ["git", "merge-survey"],
    addedDaysAgo: 22,
  },
  {
    id: "bird2009",
    authors: "Christian Bird, Peter C. Rigby, Earl T. Barr, David J. Hamilton, Daniel M. German, Prem Devanbu",
    title: "The Promises and Perils of Mining Git",
    venue: "6th IEEE International Working Conference on Mining Software Repositories (MSR), pp. 1-10",
    year: 2009,
    kind: "inproceedings",
    doi: "10.1109/MSR.2009.5069475",
    topics: ["workflow"],
    citedBy: ["git"],
    addedDaysAgo: 15,
  },
  {
    id: "macdonald2000",
    authors: "Joshua P. MacDonald",
    title: "File System Support for Delta Compression",
    venue: "Master's thesis, University of California, Berkeley",
    year: 2000,
    kind: "thesis",
    topics: ["storage"],
    citedBy: ["git"],
    addedDaysAgo: 9,
  },
  {
    id: "chacon2014",
    authors: "Scott Chacon, Ben Straub",
    title: "Pro Git, 2nd edition",
    venue: "Apress",
    year: 2014,
    kind: "book",
    url: "https://git-scm.com/book",
    topics: ["workflow"],
    citedBy: ["git"],
    addedDaysAgo: 44,
  },
  {
    id: "spinellis2005",
    authors: "Diomidis Spinellis",
    title: "Version Control Systems",
    venue: "IEEE Software, 22(5):108-109",
    year: 2005,
    kind: "article",
    topics: ["history"],
    citedBy: [],
    addedDaysAgo: 2,
  },
];

/** Entries cited by a paper, in bibliography order. */
export function referencesOf(paperId: string) {
  return references.filter((r) => r.citedBy.includes(paperId));
}

/** "Authors. Title. Venue, Year." Shared by the Bibliography and the library preview. */
export function formatReference(r: Reference) {
  return `${r.authors}. ${r.title}. ${r.venue}, ${r.year}.`;
}

/** A BibTeX record for the library export drawer. */
export function toBibtex(r: Reference) {
  const type = r.kind === "commit" || r.kind === "online" ? "misc" : r.kind === "thesis" ? "mastersthesis" : r.kind;
  const fields: [string, string][] = [
    ["author", r.authors.split(", ").join(" and ")],
    ["title", `{${r.title}}`],
    [r.kind === "article" ? "journal" : r.kind === "inproceedings" ? "booktitle" : r.kind === "book" ? "publisher" : r.kind === "thesis" ? "school" : "howpublished", r.venue],
    ["year", String(r.year)],
  ];
  if (r.doi) fields.push(["doi", r.doi]);
  if (r.url) fields.push(["url", r.url]);
  return `@${type}{${r.id},\n${fields.map(([k, v]) => `  ${k} = {${v}}`).join(",\n")}\n}`;
}
