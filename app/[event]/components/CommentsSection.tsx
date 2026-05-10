import { ReactionButtons } from '@/components/reaction-buttons';

type Props = {
  eventId: string;
};

export const CommentsSection = ({ eventId }: Props) => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">반응</h2>
      <ReactionButtons eventId={eventId} />
    </section>
  );
};
