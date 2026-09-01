with open('app/services/gemini_service.py', 'r') as f:
    content = f.read()

schemas = open('scratch/exam_kit_schemas.py').read()
content = content.replace('class GeminiService:', schemas + '\nclass GeminiService:')

method = """
    def generate_exam_kit(self, transcript_text: str, weak_topics: list[str], test_scores: list[int]) -> dict:
        prompt = (
            f"Generate a comprehensive personalized Exam Kit based on this video transcript.\\n"
            f"The student has weak topics in: {weak_topics}. Their recent test scores: {test_scores}.\\n"
            f"Tailor the 'weak_topic_revision' section and 'final_mock_exam' heavily towards these weak areas.\\n"
            f"Transcript:\\n{transcript_text[:20000]}"
        )
        return self._generate_structured_content(prompt, ExamKitResponse)
"""
content += method

with open('app/services/gemini_service.py', 'w') as f:
    f.write(content)
