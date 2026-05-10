import { ReactionButtons } from '@/components/reaction-buttons';

type Props = {
  eventId: string;
};

export const CommentsSection = ({ eventId }: Props) => {
  return (
    <section>
      <hr className="border-border/40" />
      <div className="flex justify-center pt-6">
        <ReactionButtons eventId={eventId} />
      </div>
    </section>
  );
};
