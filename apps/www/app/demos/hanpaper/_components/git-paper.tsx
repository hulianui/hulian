"use client";
import { copy } from "./git-paper.content";

import type { ReactNode } from "react";
import { Bibliography, Cite, EqRef, FigRef, PaperHeader, PaperSection, SecRef } from "@hulianui/ui";
import { PaperEquation } from "@hulianui/ui/math";
import { AUTHORS, findPaper } from "../_data/papers";
import { formatReference, referencesOf } from "../_data/references";
import { rich } from "../_lib/rich";
import {
  BranchMergeProcess,
  ObjectModelProcess,
  PackFigure,
  RebaseProcess,
  ThreeTreesProcess,
} from "./git-figures";

// The manuscript of the Git paper. It must be rendered inside a <Paper>; the caller owns the
// Paper (mode, labels, toolbar, outline). Figure, equation, section and reference ids are fixed,
// so render at most one copy per page.

const OBJECT_ID_TEX = String.raw`\mathrm{id}(o) = \mathrm{SHA1}\left(\term{type}{\mathit{type}} \,\|\, \mathtt{SP} \,\|\, \mathit{len} \,\|\, \mathtt{NUL} \,\|\, \term{content}{\mathit{content}}\right)`;
const PACK_TEX = String.raw`S_{\mathrm{loose}} = \term{n}{n}\,cS, \qquad S_{\mathrm{pack}} \approx cS + (n-1)\,(c\,\term{r}{r}\,S + \delta)`;

const CITES: Record<string, ReactNode> = {
  cRochkind: <Cite to="rochkind1975" />,
  cTichy: <Cite to="tichy1985" />,
  cTorvalds: <Cite to="torvalds2005" />,
  cOSullivan: <Cite to="osullivan2009" />,
  cMerkle: <Cite to="merkle1988" />,
  cStevens: <Cite to="stevens2017" />,
  cHashTransition: <Cite to="git-hash-transition" />,
  cHunt: <Cite to="hunt1976" />,
  cMyers: <Cite to="myers1986" />,
  cBird: <Cite to="bird2009" />,
  cMacDonald: <Cite to="macdonald2000" />,
  cChacon: <Cite to="chacon2014" />,
};

const SECS: Record<string, ReactNode> = {
  secTrees: <SecRef to="sec-trees" />,
  secObjects: <SecRef to="sec-objects" />,
  secBranch: <SecRef to="sec-branch" />,
  secRebase: <SecRef to="sec-rebase" />,
  secPack: <SecRef to="sec-pack" />,
};

/** `{figTreesAdd}` style placeholders: figure id plus step, auto-numbered as "Figure 1(b)". */
const fig = (to: string, state?: string) => <FigRef to={to} state={state} />;

const NODES: Record<string, ReactNode> = {
  ...CITES,
  ...SECS,
  eqId: <EqRef to="eq-object-id" />,
  eqPack: <EqRef to="eq-pack" />,
  figTrees: fig("fig-trees", "all"),
  figTreesEdit: fig("fig-trees", "edit"),
  figTreesAdd: fig("fig-trees", "add"),
  figTreesCommit: fig("fig-trees", "commit"),
  figTreesRestore: fig("fig-trees", "restore"),
  figObjectsBlob: fig("fig-objects", "blob"),
  figObjectsTree: fig("fig-objects", "tree"),
  figObjectsCommit: fig("fig-objects", "commit"),
  figObjectsShare: fig("fig-objects", "share"),
  figBranchMain: fig("fig-branch", "main"),
  figBranchFeature: fig("fig-branch", "feature"),
  figBranchDiverge: fig("fig-branch", "diverge"),
  figBranchBase: fig("fig-branch", "base"),
  figBranchMerge: fig("fig-branch", "merge"),
  figRebaseStart: fig("fig-rebase", "start"),
  figRebasePick: fig("fig-rebase", "pick"),
  figRebaseReplay: fig("fig-rebase", "replay"),
  figRebaseMove: fig("fig-rebase", "move"),
  figPack: fig("fig-pack"),
  figPackMany: fig("fig-pack", "many"),
  figPackHeavy: fig("fig-pack", "heavy"),
};

const P = ({ children }: { children: string }) => <p>{rich(children, NODES)}</p>;

export function GitPaperHeader() {
  const paper = findPaper("git");
  return (
    <PaperHeader
      title={paper?.title}
      authors={[
        { name: AUTHORS.lin, affiliation: copy("affiliationLab"), email: "lin@hanpaper.dev" },
        { name: AUTHORS.zhou, affiliation: copy("affiliationLab"), email: "zhou@hanpaper.dev" },
        { name: AUTHORS.chen, affiliation: copy("affiliationUniv") },
      ]}
      meta={copy("meta")}
      abstract={copy("abstract")}
    />
  );
}

export function GitPaperBody() {
  return (
    <>
      <PaperSection id="sec-intro" title={copy("secIntro")}>
        <P>{copy("introP1")}</P>
        <P>{copy("introP2")}</P>
      </PaperSection>

      <PaperSection id="sec-related" title={copy("secRelated")}>
        <P>{copy("relatedP1")}</P>
        <P>{copy("relatedP2")}</P>
      </PaperSection>

      <PaperSection id="sec-trees" title={copy("secTrees")}>
        <P>{copy("treesP1")}</P>
        <ThreeTreesProcess />
        <PaperSection id="sec-index" title={copy("secIndex")}>
          <P>{copy("indexP1")}</P>
        </PaperSection>
      </PaperSection>

      <PaperSection id="sec-objects" title={copy("secObjects")}>
        <P>{copy("objectsP1")}</P>
        <PaperEquation
          id="eq-object-id"
          terms={{
            type: { label: copy("termType"), figure: "fig-objects", state: "all" },
            content: { label: copy("termContent"), figure: "fig-objects", state: "blob" },
          }}
        >
          {OBJECT_ID_TEX}
        </PaperEquation>
        <P>{copy("objectsP2")}</P>
        <ObjectModelProcess />
        <PaperSection id="sec-integrity" title={copy("secIntegrity")}>
          <P>{copy("integrityP1")}</P>
        </PaperSection>
      </PaperSection>

      <PaperSection id="sec-branch" title={copy("secBranch")}>
        <P>{copy("branchP1")}</P>
        <BranchMergeProcess />
        <P>{copy("branchP2")}</P>
      </PaperSection>

      <PaperSection id="sec-rebase" title={copy("secRebase")}>
        <P>{copy("rebaseP1")}</P>
        <RebaseProcess />
        <P>{copy("rebaseP2")}</P>
      </PaperSection>

      <PaperSection id="sec-pack" title={copy("secPack")}>
        <P>{copy("packP1")}</P>
        <PaperEquation
          id="eq-pack"
          terms={{
            n: { label: copy("termN"), figure: "fig-pack", state: "many" },
            r: { label: copy("termR"), figure: "fig-pack", state: "heavy" },
          }}
        >
          {PACK_TEX}
        </PaperEquation>
        <PackFigure />
        <P>{copy("packP2")}</P>
      </PaperSection>

      <PaperSection id="sec-conclusion" title={copy("secConclusion")}>
        <P>{copy("conclusionP1")}</P>
      </PaperSection>

      <PaperSection id="sec-ack" title={copy("secAck")} numbered={false}>
        <P>{copy("ackP1")}</P>
      </PaperSection>

      <Bibliography
        entries={referencesOf("git").map((r) => ({ id: r.id, content: formatReference(r) }))}
      />
    </>
  );
}

/** Body typography for the manuscript: Paper leaves paragraphs to the caller. */
export function ManuscriptBody({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[720px] text-[15.5px] leading-[1.85] [&_p]:my-3 [&_p]:text-justify [&_p]:[text-indent:2em]">
      {children}
    </div>
  );
}
