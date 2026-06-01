

/**
 * LingoStar Vision Reader - 거대 접근성 터치 버튼 (BigButton)
 * 
 * 태블릿 환경에서 시각장애/저시력 아동의 오터치를 방지하기 위해 최소 72px 이상의
 * 물리적인 터치 면적을 보장하고, HSL 테마 연동 및 부드러운 스케일 탭 애니메이션을 제공합니다.
 * 스크린 리더 사용자를 위한 철저한 ARIA 접근성 표준을 준수합니다.
 * 
 * @param {object} props
 * @param {'primary' | 'secondary' | 'success'} [props.variant='primary'] - 버튼의 디자인 스타일 (주버튼, 보조버튼, 성공버튼)
 * @param {boolean} [props.disabled=false] - 버튼 비활성화 여부
 * @param {string} [props.ariaLabel] - 스크린 리더용 상세 설명 텍스트
 * @param {React.ReactNode} props.children - 버튼 내부 렌더링 요소
 * @param {React.ComponentPropsWithoutRef<'button'>} props - 기타 HTML 버튼 속성
 */
export const BigButton = ({
  children,
  variant = 'primary',
  disabled = false,
  ariaLabel,
  onClick,
  className = '',
  ...props
}) => {
  
  // 1. variant 및 상태별 HSL CSS 클래스 바인딩
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'big-btn-secondary';
      case 'success':
        return 'big-btn-success';
      case 'primary':
      default:
        return 'big-btn-primary';
    }
  };

  return (
    <button
      type="button"
      className={`big-accessibility-btn ${getVariantClass()} ${className}`}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      <span className="big-btn-content">
        {children}
      </span>
    </button>
  );
};

export default BigButton;
