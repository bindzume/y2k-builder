export const generateExportCode = (elements, bgImage, bgImageStyle, bgImageTileSize, bgMusic, bgMusicMode, cursor, pageTitle, pageHeight, pagePadding, pageMargin, pageColor) => {
  const allElements = elements;
  const rootElements = elements.filter(el => !el.parentId);

  const getElementStyle = (el) => {
    const isChild = !!el.parentId;
    let extraCss = '';

    // Core Layout
    if (el.type === 'flex') {
      extraCss += `
        display: flex;
        flex-direction: ${el.flexDirection || 'row'};
        justify-content: ${el.justifyContent || 'flex-start'};
        align-items: ${el.alignItems || 'stretch'};
        gap: ${el.gap || 0}px;
        flex-wrap: ${el.marqueeEnabled ? 'nowrap' : 'wrap'};
        ${el.marqueeEnabled ? 'overflow: hidden;' : ''}
      `;
    } else if (el.type === 'marquee' || el.type === 'button' || el.type === 'counter') {
      extraCss += 'display: flex; align-items: center; justify-content: center;';
    } else if (el.type === 'table') {
        extraCss += `border-collapse: collapse;`;
    }

    if (el.type !== 'flex' && el.style.verticalAlign && el.style.verticalAlign !== 'top') {
        extraCss += `
            display: flex;
            flex-direction: column;
            justify-content: ${el.style.verticalAlign === 'middle' ? 'center' : 'flex-end'};
        `;
    }

    if (isChild) {
        if (el.flexGrow) extraCss += 'flex-grow: 1;';
        if (el.fullHeight) extraCss += 'height: 100%;';
        if (el.fullWidth) extraCss += 'align-self: stretch; width: 100%;';
    }

    const positionCss = isChild ? `
        position: relative;
        left: auto; top: auto;
    ` : `
        position: absolute;
        left: ${el.fullWidth ? pagePadding + 'px' : el.x + 'px'};
        top: ${el.y}px;
        z-index: ${el.zIndex};
    `;

    const widthCss = el.fullWidth ? `width: calc(100% - ${pagePadding * 2}px);` : (el.width ? `width: ${el.width}px;` : '');
    const heightCss = (isChild && el.fullHeight) ? '' : (el.height ? `height: ${el.height}px;` : '');

    const paddingCss = `padding: ${el.style.paddingTop || 0}px ${el.style.paddingRight || 0}px ${el.style.paddingBottom || 0}px ${el.style.paddingLeft || 0}px;`;

    // Divider Specific Style
    if (el.type === 'hr') {
        return `
            #${el.id} {
                box-sizing: border-box;
                ${positionCss}
                ${widthCss}
                height: ${el.height}px;
                background-color: ${el.style.backgroundColor || '#000000'};
                ${paddingCss}
                border: none;
                margin: 0;
                background-clip: content-box;
            }
        `;
    }

    // Side-specific Borders
    const borderCss = `
        border-top: ${el.style.borderTopWidth || 0}px ${el.style.borderStyle || 'solid'} ${el.style.borderColor || '#000000'};
        border-right: ${el.style.borderRightWidth || 0}px ${el.style.borderStyle || 'solid'} ${el.style.borderColor || '#000000'};
        border-bottom: ${el.style.borderBottomWidth || 0}px ${el.style.borderStyle || 'solid'} ${el.style.borderColor || '#000000'};
        border-left: ${el.style.borderLeftWidth || 0}px ${el.style.borderStyle || 'solid'} ${el.style.borderColor || '#000000'};
    `;

    // Background Gradient Handling
    let backgroundStyle = `background-color: ${el.style.backgroundColor || 'transparent'};`;
    if (el.style.bgGradientEnabled) {
        backgroundStyle = `background: linear-gradient(${el.style.bgGradientAngle || 0}deg, ${el.style.bgGradientStart || '#ffffff'}, ${el.style.bgGradientEnd || '#000000'});`;
    }

    // Background Image Handling (supports layering with gradient)
    if (el.style.backgroundImage) {
      const imgSrc = el.style.backgroundImage;
      const imgStyle = el.style.backgroundImageStyle || 'cover';
      const tileSize = el.style.backgroundImageTileSize || el.backgroundImageTileSize || 200;

      if (el.style.bgGradientEnabled) {
        // Layer gradient then image
        backgroundStyle = `background-image: linear-gradient(${el.style.bgGradientAngle || 0}deg, ${el.style.bgGradientStart || '#ffffff'}, ${el.style.bgGradientEnd || '#000000'}), url('${imgSrc}');`;
      } else {
        backgroundStyle = `background-image: url('${imgSrc}');`;
      }

      // sizing / repeat
      if (imgStyle === 'cover') {
        backgroundStyle += ` background-size: ${el.style.bgGradientEnabled ? 'auto, cover' : 'cover'}; background-repeat: no-repeat; background-position: center;`;
      } else if (imgStyle === 'contain') {
        backgroundStyle += ` background-size: ${el.style.bgGradientEnabled ? 'auto, contain' : 'contain'}; background-repeat: no-repeat; background-position: center;`;
      } else if (imgStyle === 'repeat') {
        backgroundStyle += ` background-size: ${el.style.bgGradientEnabled ? 'auto, ${tileSize}px ${tileSize}px' : `${tileSize}px ${tileSize}px`}; background-repeat: repeat;`;
      } else if (imgStyle === 'center') {
        backgroundStyle += ` background-size: auto; background-position: center; background-repeat: no-repeat;`;
      } else {
        backgroundStyle += ` background-size: auto; background-repeat: no-repeat;`;
      }
    }

    // Text Color / Gradient Handling
    let colorStyle = `color: ${el.style.color || '#000000'};`;
    if (el.style.textGradientEnabled) {
        colorStyle = `
            background: linear-gradient(${el.style.textGradientAngle || 0}deg, ${el.style.textGradientStart || '#ffffff'}, ${el.style.textGradientEnd || '#000000'});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: transparent;
        `;
    }

    const tShadow = el.style.textShadowEnabled
        ? `${el.style.textShadowX || 2}px ${el.style.textShadowY || 2}px ${el.style.textShadowBlur || 0}px ${el.style.textShadowColor || '#000000'}`
        : 'none';

    return `
      #${el.id} {
        box-sizing: border-box;
        ${positionCss}
        display: ${el.style.display || 'block'};
        ${widthCss}
        ${heightCss}
        overflow: hidden;
        ${backgroundStyle}
        ${colorStyle}
        ${borderCss}
        ${el.style.borderRadius ? `border-radius: ${el.style.borderRadius}px;` : ''}
        ${el.style.fontFamily ? `font-family: ${el.style.fontFamily};` : ''}
        ${el.style.fontSize ? `font-size: ${el.style.fontSize}px;` : ''}
        ${el.style.textAlign ? `text-align: ${el.style.textAlign};` : ''}
        ${paddingCss}
        font-weight: ${el.style.fontWeight || 'normal'};
        font-style: ${el.style.fontStyle || 'normal'};
        text-decoration: ${el.style.textDecoration || 'none'};
        text-transform: ${el.style.textTransform || 'none'};
        letter-spacing: ${el.style.letterSpacing || 0}px;
        line-height: ${el.style.lineHeight || 1.2};
        text-shadow: ${tShadow};
        transform: rotate(${el.rotation || 0}deg) skew(${el.skewX || 0}deg, ${el.skewY || 0}deg);
        opacity: ${el.opacity || 1};
        ${el.isBlinking ? `animation: blinker ${el.blinkSpeed || 1}s linear infinite;` : ''}
        ${extraCss}
      }
    `;
  };

  const styles = elements.map(el => getElementStyle(el)).join('\n');

  // Generate marquee keyframes for flex elements with marquee enabled
  const marqueeKeyframes = elements
    .filter(el => el.type === 'flex' && el.marqueeEnabled)
    .map(el => {
      const direction = el.marqueeDirection || 'left';
      const animationName = `marquee-${direction}-${el.id}`;
      const axis = direction === 'left' || direction === 'right' ? 'X' : 'Y';
      const sign = direction === 'left' || direction === 'up' ? '-' : '';
      return `
        @keyframes ${animationName} {
          0% { transform: translate${axis}(0); }
          100% { transform: translate${axis}(${sign}50%); }
        }
      `;
    })
    .join('\n');

  const renderElementHtml = (el) => {
    let content = '';
    const children = allElements.filter(child => child.parentId === el.id);
    children.sort((a,b) => a.zIndex - b.zIndex);

    if (el.type === 'flex') {
      const childrenHtml = children.map(child => renderElementHtml(child)).join('\n');
      if (el.marqueeEnabled && children.length > 0) {
        const direction = el.marqueeDirection || 'left';
        const speed = el.marqueeSpeed || 10;
        const animationName = `marquee-${direction}-${el.id}`;
        content = `<div class="marquee-wrapper" style="display: flex; flex-direction: ${el.flexDirection || 'row'}; align-items: ${el.alignItems || 'stretch'}; gap: ${el.gap || 0}px; animation: ${animationName} ${speed}s linear infinite;">${childrenHtml}${childrenHtml}</div>`;
      } else {
        content = childrenHtml;
      }
    } else if (el.type === 'table') {
        const rows = el.rows || 2;
        const cols = el.cols || 2;
        const gap = el.gap || 0;
        for (let r = 0; r < rows; r++) {
            content += '<tr>';
            for (let c = 0; c < cols; c++) {
                const child = children.find(ch => ch.tableCell === `${r}-${c}`);
                let cellInner = '&nbsp;';
                if (child) {
                    cellInner = renderElementHtml(child);
                }
                const borderStyle = el.style.borderWidth ? `border: 1px solid ${el.style.borderColor};` : '';
                content += `<td style="${borderStyle} padding: ${gap}px; vertical-align: top;">${cellInner}</td>`;
            }
            content += '</tr>';
        }
    } else {
        if (el.type === 'text') { content = String(el.content || ""); }
        else if (el.type === 'image') { content = `<img src="${el.src}" alt="img" style="object-fit: cover; width: 100%; height: 100%;" />`; }
        else if (el.type === 'marquee') { content = `<marquee scrollamount="5" style="width: 100%;">${String(el.content || "")}</marquee>`; }
        else if (el.type === 'button') { content = String(el.content || ""); }
        else if (el.type === 'hr') { content = ''; }
        else if (el.type === 'counter') {
            const uniqueCode = el.uniqueCode || 'unique-code';
            const label = el.badgeLabel || 'Visitors';
            const color = el.badgeColor || '%23263759';
            const style = el.badgeStyle || 'flat-square';
            const labelStyle = el.badgeLabelStyle || 'default';
            const badgeUrl = `https://api.visitorbadge.io/api/visitors?path=${uniqueCode}&label=${encodeURIComponent(label)}&countColor=${color}&style=${style}&labelStyle=${labelStyle}`;
            const linkUrl = `https://visitorbadge.io/status?path=${uniqueCode}`;
            content = `<a href="${linkUrl}"><img src="${badgeUrl}" alt="Visitor Counter" style="max-width: 100%; max-height: 100%; object-fit: contain;" /></a>`;
        }
        else if (el.type === 'webring') {
            content = `
                <div style="display:flex; flex-direction:column; height:100%; align-items:center; justify-content:center; border:2px outset white; padding:2px;">
                <div style="font-weight:bold; margin-bottom:4px;">${String(el.content || "")}</div>
                <div style="display:flex; gap:10px; font-size:12px;">
                    <a href="#">&lt; Prev</a>
                    <a href="#">Hub</a>
                    <a href="#">Next &gt;</a>
                </div>
                </div>
            `;
        } else if (el.type === 'guestbook') {
            content = `
                <div style="padding:10px; height:100%; overflow:auto;">
                <div style="text-align:center; font-weight:bold; margin-bottom:10px;">${String(el.content || "")}</div>
                <div id="msgs_${el.id}" style="margin-top:10px; text-align:left; font-size:0.9em;">
                    <div style="border-bottom:1px dashed #999; margin-bottom:5px;"><b>CoolGuy99:</b> Awesome site!!</div>
                </div>
                </div>
            `;
        } else if (el.type === 'custom-html') {
            content = String(el.content || "");
        }
    }

    const tag = (el.type === 'hr' || el.type === 'table') ? 'div' : (el.tagName || 'div');
    if (el.href && el.type !== 'guestbook' && el.type !== 'counter') {
      // FIX: Use inherit to ensure #id styles flow into the anchor correctly
      return `<a id="${el.id}" href="${el.href}" target="_blank">${content}</a>`;
    }
    return `<${tag} id="${el.id}">${content}</${tag}>`;
  };

  const htmlContent = rootElements.map(el => renderElementHtml(el)).join('\n');

  // Generate background style based on bgImageStyle
  const getBackgroundStyle = () => {
    if (!bgImage) return '';

    switch (bgImageStyle) {
      case 'cover':
        return 'background-size: cover; background-position: center; background-repeat: no-repeat;';
      case 'contain':
        return 'background-size: contain; background-position: center; background-repeat: no-repeat;';
      case 'repeat':
        return 'background-size: auto; background-repeat: repeat;';
      case 'tile':
        return `background-size: ${bgImageTileSize}px ${bgImageTileSize}px; background-repeat: repeat;`;
      case 'center':
        return 'background-size: auto; background-position: center; background-repeat: no-repeat;';
      default:
        return 'background-size: cover; background-position: center; background-repeat: no-repeat;';
    }
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${pageTitle || 'My Y2K Website'}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: ${pageMargin}px;
      padding: 0;
      width: calc(100vw - ${pageMargin * 2}px);
      min-height: ${pageHeight}px;
      overflow-x: hidden;
      background-color: ${pageColor};
      ${bgImage ? `background-image: url('${bgImage}');` : ''}
      ${bgImage ? getBackgroundStyle() : ''}
      ${cursor ? `cursor: url('${cursor}'), auto;` : ''}
    }
    .page-wrapper {
        position: relative;
        padding: ${pagePadding}px;
        min-height: ${pageHeight}px;
        width: 100%;
        box-sizing: border-box;
    }
    a { color: inherit; }
    @keyframes blinker { 50% { opacity: 0; } }
    .blink-text { animation: blinker 1s linear infinite; }
    ${marqueeKeyframes}
    ${styles}
  </style>
</head>
<body>

    ${bgMusic ? (bgMusicMode === 'audio-tag' ? `
  <!-- Background Music: HTML5 Audio Tag -->
  <audio controls loop autoplay style="position: fixed; bottom: 10px; right: 10px; z-index: 9999;">
    <source src="${bgMusic}" type="audio/mpeg">
    Your browser does not support the audio element.
  </audio>
  ` : `
  <!-- Background Music: Web Audio API (Seamless Loop) -->
  <script>
    // Wait for the user to interact with the page to bypass Autoplay blockers
    document.addEventListener('mousemove', function initAudio() {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      fetch('${bgMusic}')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.loop = true; // This does a TRUE seamless memory loop!
          source.connect(audioCtx.destination);
          source.start();
        })
        .catch(e => console.error("Audio error:", e));

      // Remove the listener so it only triggers once
      document.removeEventListener('click', initAudio);
    }, { once: true });
  </script>
  `) : ''}
  <div class="page-wrapper">
    ${htmlContent}
  </div>
</body>
</html>`;
};
