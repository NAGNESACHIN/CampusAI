from dataclasses import dataclass
@dataclass
class SourceChunk:
    source:str
    text:str
class RAGService:
    def __init__(self): self.chunks=[]
    def add_document(self,source,text,chunk_size=180):
        words=text.split()
        for i in range(0,len(words),chunk_size):
            part=" ".join(words[i:i+chunk_size]).strip()
            if part:self.chunks.append(SourceChunk(source,part))
    def retrieve(self,question,limit=4):
        terms={x.lower().strip(".,?!") for x in question.split() if len(x)>2}
        scored=[(sum(t in c.text.lower() for t in terms),c) for c in self.chunks]
        return [c for score,c in sorted(scored,key=lambda x:x[0],reverse=True)[:limit] if score]
    def build_context(self,question):
        matches=self.retrieve(question)
        return "\n\n".join(f"[{i+1}] {c.text}" for i,c in enumerate(matches)),[c.source for c in matches]
    def generate_answer(self,question,context):
        if not context:return "I don't have enough approved course material to answer this reliably yet. Ask faculty to add the relevant subject material."
        return "Relevant course material was retrieved. The LLM provider can now turn this context into a grounded answer.\n\nRetrieved context:\n"+context
rag_service=RAGService()
