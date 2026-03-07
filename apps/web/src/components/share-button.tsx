'use client';

import { useState } from 'react';

type ShareButtonProps = {
  title: string;
  text: string;
  url: string;
};

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [message, setMessage] = useState('');

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        setMessage('공유가 완료되었습니다.');
        return;
      }

      await navigator.clipboard.writeText(url);
      setMessage('링크가 클립보드에 복사되었습니다.');
    } catch {
      setMessage('공유에 실패했습니다. 권한을 확인해 주세요.');
    }
  };

  return (
    <div className="space-y-2">
      <button className="mbti-button" onClick={onShare} type="button">
        결과 공유하기
      </button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
