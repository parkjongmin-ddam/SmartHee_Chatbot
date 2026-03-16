# Chatbot Project

## 목표
SmartHee(멀티에이전트 플랫폼)에서 에이전트 빌더 없이
바로 Claude API와 대화하는 단순 채팅 앱으로 변환

## 기술 스택
- Backend: FastAPI, Python 3.13, uvicorn
- Frontend: React 18, Vite, TypeScript
- LLM: Anthropic Claude API (claude-sonnet-4-5-20251001)
- 환경변수: backend/.env 의 ANTHROPIC_API_KEY

## 핵심 요구사항
1. 에이전트 생성 단계 없음 — 앱 로드 즉시 채팅 가능
2. POST /api/chat { messages: [] } → { reply: string } 단일 엔드포인트
3. 대화 히스토리 프론트엔드 state로 유지
4. 스트리밍 없이 단순 응답
5. 다크 테마, JetBrains Mono 폰트
