
class RevisionNoteTopic(BaseModel):
    topic: str
    key_points: list[str]

class ImportantQuestion(BaseModel):
    question: str
    answer: str

class WeakTopicRevision(BaseModel):
    topic: str
    explanation: str
    focus_areas: list[str]

class MockExamQuestion(BaseModel):
    question: str
    options: list[str]
    correct_answer: str

class ExamKitResponse(BaseModel):
    revision_notes: list[RevisionNoteTopic]
    important_questions: list[ImportantQuestion]
    weak_topic_revision: list[WeakTopicRevision]
    final_mock_exam: list[MockExamQuestion]
