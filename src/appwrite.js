import { Query, Client, Databases, ID } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client().setEndpoint("https://cloud.appwrite.io/v1").setProject(PROJECT_ID);
const databases = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal("searchTerm", searchTerm)
        ]);

        if (result.documents.length > 0) {
            const documentId = result.documents[0]; // Get the first document
            await databases.updateDocument(DATABASE_ID, COLLECTION_ID, documentId.$id, {
                count: documentId.count + 1, // Corrected count update
            });
        } else {
            await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`, // Fixed URL typo
            });
        }
    } catch (error) {
        console.error("Failed to fetch documents", error);
    }
};

export const getTrendingMovies = async () => {
    try {
        const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count")
        ]);
        return result.documents;
    } catch (error) {
        console.error("Failed to fetch trending movies", error);
    }
};
