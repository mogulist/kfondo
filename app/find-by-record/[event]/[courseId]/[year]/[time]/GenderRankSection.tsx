"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ResultCard from "./ResultCard";

type Gender = "male" | "female";

type Props = {
  rankMale: number | null;
  rankFemale: number | null;
  finishersMale: number;
  finishersFemale: number;
  scopePeoplePrefix: string;
};

const GenderRankSection = ({
  rankMale,
  rankFemale,
  finishersMale,
  finishersFemale,
  scopePeoplePrefix,
}: Props) => {
  const [gender, setGender] = React.useState<Gender | null>(null);

  if (rankMale == null && rankFemale == null) return null;

  const itemClassName =
    "h-7 min-h-7 rounded-sm border border-transparent bg-transparent px-2.5 py-0 text-sm font-medium leading-none shadow-none ring-offset-0 hover:bg-transparent hover:text-foreground data-[state=on]:border-input data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-none focus-visible:z-10";

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">성별 순위 보기</span>
        <ToggleGroup
          type="single"
          value={gender ?? ""}
          onValueChange={(value) =>
            setGender(value ? (value as Gender) : null)
          }
          size="sm"
          className="w-fit justify-start gap-0 rounded-md bg-muted/60 p-0.5 text-muted-foreground"
          aria-label="성별 순위 보기"
        >
          {rankMale != null ? (
            <ToggleGroupItem value="male" className={itemClassName}>
              남
            </ToggleGroupItem>
          ) : null}
          {rankFemale != null ? (
            <ToggleGroupItem value="female" className={itemClassName}>
              여
            </ToggleGroupItem>
          ) : null}
        </ToggleGroup>
      </div>
      {gender ? (
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {gender === "male" && rankMale != null ? (
            <ResultCard
              main={`${rankMale}위`}
              label="남자 순위"
              subLabel={`${scopePeoplePrefix}${finishersMale.toLocaleString()}명 기준`}
              testId="rank-male"
            />
          ) : null}
          {gender === "female" && rankFemale != null ? (
            <ResultCard
              main={`${rankFemale}위`}
              label="여자 순위"
              subLabel={`${scopePeoplePrefix}${finishersFemale.toLocaleString()}명 기준`}
              testId="rank-female"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default GenderRankSection;
