export interface Question {
    question: string;
    answer: string;
}

export async function generateQuestions(imageFile: File): Promise<Question[]> {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "문제 생성 실패");
    }

    return data.questions;
}
