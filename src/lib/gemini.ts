export interface Question {
    question: string;
    answer: string;
}

/**
 * 이미지를 WebP로 변환하고 리사이즈하여 용량을 줄입니다.
 * @param file 원본 이미지 파일
 * @param maxSize 최대 가로/세로 크기 (기본값: 768px)
 * @param quality WebP 품질 (0-1, 기본값: 0.8)
 * @returns WebP로 변환된 File 객체
 */
export async function compressToWebP(
    file: File,
    maxSize: number = 768,
    quality: number = 0.8
): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // 원본 비율 유지하면서 리사이즈
            let { width, height } = img;
            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = (height / width) * maxSize;
                    width = maxSize;
                } else {
                    width = (width / height) * maxSize;
                    height = maxSize;
                }
            }

            // Canvas에 그리기
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Canvas context 생성 실패"));
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);

            // WebP로 변환
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("WebP 변환 실패"));
                        return;
                    }
                    const webpFile = new File([blob], "image.webp", {
                        type: "image/webp",
                    });
                    console.log(
                        `이미지 압축: ${(file.size / 1024).toFixed(1)}KB → ${(webpFile.size / 1024).toFixed(1)}KB (${((1 - webpFile.size / file.size) * 100).toFixed(0)}% 감소)`
                    );
                    resolve(webpFile);
                },
                "image/webp",
                quality
            );
        };
        img.onerror = () => reject(new Error("이미지 로드 실패"));
        img.src = URL.createObjectURL(file);
    });
}

export interface GenerateResult {
    questions?: Question[];
    notMathProblem?: boolean;
    message?: string;
}

export async function generateQuestions(imageFile: File): Promise<GenerateResult> {
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

    // Return the full response including notMathProblem flag
    return data;
}
