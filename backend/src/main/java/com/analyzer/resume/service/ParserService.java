package com.analyzer.resume.service;

import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.Parser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

@Service
public class ParserService {

    public String parsePdf(byte[] pdfBytes) {
        try (InputStream stream = new ByteArrayInputStream(pdfBytes)) {
            Parser parser = new AutoDetectParser();
            BodyContentHandler handler = new BodyContentHandler(-1); // -1 disables the default write limit (usually 100k characters)
            Metadata metadata = new Metadata();
            ParseContext context = new ParseContext();

            parser.parse(stream, handler, metadata, context);
            return handler.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse PDF file content: " + e.getMessage(), e);
        }
    }
}
