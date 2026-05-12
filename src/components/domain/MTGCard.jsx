import { useState } from 'react';

import { ManaCost } from './ManaCost';
import { CommanderBadge } from './CommanderBadge';

import './MTGCard.css';

function getImageUrls(carta) {
  if (!carta) return { small: null, normal: null };
  const uris = carta.image_uris ?? {};
  return {
    small: uris.small ?? uris.normal ?? carta.imageSmall ?? carta.imageNormal ?? null,
    normal: uris.normal ?? uris.small ?? carta.imageNormal ?? carta.imageSmall ?? null,
  };
}

function CardImage({ src, srcSet, sizes, alt, onError, onLoad, className, prioridad }) {
  return (
    <img
      className={className}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      onError={onError}
      onLoad={onLoad}
      loading={prioridad === 'alta' ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

export function MTGCard({ carta, variant = 'thumbnail', onClick, esComandante, prioridad = 'auto' }) {
  const [imgError, setImgError] = useState(false);
  const [imgCargada, setImgCargada] = useState(false);
  const { small, normal } = getImageUrls(carta);

  const altText = carta?.name ?? carta?.nombre ?? 'Carta MTG';
  const manaCost = carta?.mana_cost ?? carta?.manaCost ?? '';
  const hasClick = typeof onClick === 'function';

  const handleKeyDown = hasClick ? (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  } : undefined;

  if (variant === 'thumbnail') {
    return (
      <div
        className={`mtg-card mtg-card--thumbnail${hasClick ? ' mtg-card--clickable' : ''}${esComandante ? ' mtg-card--commander' : ''}`}
        onClick={hasClick ? onClick : undefined}
        role={hasClick ? 'button' : undefined}
        tabIndex={hasClick ? 0 : undefined}
        onKeyDown={handleKeyDown}
        aria-label={altText}
      >
        {esComandante && (
          <span className="mtg-card__commander-badge">
            <CommanderBadge />
          </span>
        )}
        {imgError || (!small && !normal) ? (
          <div className="mtg-card__image mtg-card__image--placeholder" aria-label={altText} />
        ) : (
          <>
            {!imgCargada && <div className="mtg-card__skeleton" aria-hidden="true" />}
            <CardImage
              className={`mtg-card__image${!imgCargada ? ' mtg-card__image--oculta' : ''}`}
              src={small || normal}
              srcSet={small && normal ? `${small} 146w, ${normal} 488w` : undefined}
              sizes="100px"
              alt={altText}
              onError={() => setImgError(true)}
              onLoad={() => setImgCargada(true)}
              prioridad={prioridad}
            />
          </>
        )}
        {normal && !imgError && imgCargada && (
          <div className="mtg-card__preview" aria-hidden="true">
            <img src={normal} alt="" className="mtg-card__preview-image" loading="lazy" decoding="async" />
          </div>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div
        className={`mtg-card mtg-card--inline${hasClick ? ' mtg-card--clickable' : ''}${esComandante ? ' mtg-card--commander' : ''}`}
        onClick={hasClick ? onClick : undefined}
        role={hasClick ? 'button' : undefined}
        tabIndex={hasClick ? 0 : undefined}
        onKeyDown={handleKeyDown}
      >
        {imgError || (!small && !normal) ? (
          <div className="mtg-card__image mtg-card__image--placeholder" aria-label={altText} />
        ) : (
          <>
            {!imgCargada && <div className="mtg-card__skeleton mtg-card__skeleton--inline" aria-hidden="true" />}
            <CardImage
              className={`mtg-card__image${!imgCargada ? ' mtg-card__image--oculta' : ''}`}
              src={small || normal}
              alt={altText}
              onError={() => setImgError(true)}
              onLoad={() => setImgCargada(true)}
              prioridad={prioridad}
            />
          </>
        )}
        <div className="mtg-card__info">
          <span className="mtg-card__name">{altText}</span>
          {manaCost && <ManaCost cost={manaCost} />}
        </div>
        {esComandante && (
          <span className="mtg-card__inline-badge">
            <CommanderBadge />
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`mtg-card mtg-card--full${esComandante ? ' mtg-card--commander' : ''}`}>
      {imgError || (!small && !normal) ? (
        <div className="mtg-card__image mtg-card__image--placeholder" aria-label={altText} />
      ) : (
        <>
          {!imgCargada && <div className="mtg-card__skeleton mtg-card__skeleton--full" aria-hidden="true" />}
          <CardImage
            className={`mtg-card__image${!imgCargada ? ' mtg-card__image--oculta' : ''}`}
            src={normal || small}
            srcSet={small && normal ? `${small} 146w, ${normal} 488w` : undefined}
            sizes="(max-width: 768px) 146px, 240px"
            alt={altText}
            onError={() => setImgError(true)}
            onLoad={() => setImgCargada(true)}
            prioridad={prioridad}
          />
        </>
      )}
      <div className="mtg-card__details">
        <div className="mtg-card__name-row">
          <span className="mtg-card__name">{altText}</span>
          {manaCost && <ManaCost cost={manaCost} />}
        </div>
        {carta?.type_line && (
          <span className="mtg-card__type">{carta.type_line}</span>
        )}
        {esComandante && (
          <div className="mtg-card__commander-badge">
            <CommanderBadge />
          </div>
        )}
      </div>
    </div>
  );
}

export default MTGCard;
