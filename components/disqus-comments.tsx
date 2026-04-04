'use client';

import { DiscussionEmbed } from 'disqus-react';

type DisqusCommentsProps = {
  eventId: string;
  eventTitle: string;
};

export function DisqusComments({ eventId, eventTitle }: DisqusCommentsProps) {
  const disqusShortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME;
  const publicSiteBase =
    process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  if (!disqusShortname || !publicSiteBase) {
    return null;
  }

  const disqusConfig = {
    url: `${publicSiteBase}/${eventId}`,
    identifier: eventId,
    title: eventTitle,
  };

  return (
    <div className="mt-8">
      <DiscussionEmbed
        shortname={disqusShortname}
        config={disqusConfig}
      />
    </div>
  );
} 