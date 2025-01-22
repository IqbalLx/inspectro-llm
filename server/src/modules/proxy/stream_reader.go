package proxy

import (
	"bufio"
	"bytes"
	"io"
)

var dataHeader = []byte("data: ")

type streamReader struct {
	reader     *bufio.Reader
	pipeWriter *io.PipeWriter
}

func (s *streamReader) Process() {
	defer s.pipeWriter.Close()

	for {
		rawLine, err := s.reader.ReadBytes('\n')
		if err != nil {
			if err == io.EOF {
				break
			} else {
				// ignore error, as this processor task is consume any response from proxied request
				continue
			}
		}

		noSpaceLine := bytes.TrimSpace(rawLine)
		noPrefixLine := bytes.TrimPrefix(noSpaceLine, dataHeader)
		str := string(noPrefixLine)
		if str == "[DONE]" {
			break
		}

		s.pipeWriter.Write(noPrefixLine)
	}
}

func NewStreamReader(reader io.Reader, pipeWriter *io.PipeWriter) *streamReader {
	bufioReader := bufio.NewReader(reader)
	return &streamReader{reader: bufioReader, pipeWriter: pipeWriter}
}
